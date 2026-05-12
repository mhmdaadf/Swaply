const Trade = require('../models/Trade');
const Item = require('../models/Item');
const Rating = require('../models/Rating');
const User = require('../models/User');
const emailService = require('../services/emailService');
const notificationController = require('./notificationController');

const calculateTrustScore = (user) => {
  if (user.totalRatings === 0) return 5.0; // Base score for new users
  
  const ratingAvg = user.ratingSum / user.totalRatings;
  const completionRatio = user.completedTrades / (user.completedTrades + user.cancelledTrades || 1);
  
  // Base 80% on ratings, 20% on completion ratio
  let score = (ratingAvg * 0.8) + (completionRatio * 5 * 0.2);
  
  // Bonus for high volume of successful trades (up to +0.5)
  const volumeBonus = Math.min(user.completedTrades * 0.05, 0.5);
  score += volumeBonus;

  return Math.min(Math.max(parseFloat(score.toFixed(1)), 0), 5.0);
};

exports.createTrade = async (req, res, next) => {
  try {
    const { receiverId, offeredItemIds, requestedItemIds } = req.body;
    const initiatorId = req.user._id;

    if (initiatorId.toString() === receiverId) {
      return res.status(400).json({ message: 'Cannot trade with yourself' });
    }

    // Validate offered items belong to initiator and are available
    const offeredItems = await Item.find({
      _id: { $in: offeredItemIds },
      owner: initiatorId,
      status: 'available',
    });
    if (offeredItems.length !== offeredItemIds.length) {
      return res.status(400).json({ message: 'One or more offered items are invalid or unavailable' });
    }

    // Validate requested items belong to receiver and are available
    const requestedItems = await Item.find({
      _id: { $in: requestedItemIds },
      owner: receiverId,
      status: 'available',
    });
    if (requestedItems.length !== requestedItemIds.length) {
      return res.status(400).json({ message: 'One or more requested items are invalid or unavailable' });
    }

    const trade = await Trade.create({
      initiator: initiatorId,
      receiver: receiverId,
      offeredItems: offeredItemIds,
      requestedItems: requestedItemIds,
    });

    const populated = await Trade.findById(trade._id)
      .populate('initiator', 'username email trustScore profilePic')
      .populate('receiver', 'username email trustScore profilePic')
      .populate('offeredItems')
      .populate('requestedItems');

    // Notify receiver
    await emailService.sendTradeNotification(populated.receiver, populated.initiator, 'new_proposal');
    await notificationController.createNotification(req.app, {
      recipient: receiverId,
      sender: initiatorId,
      type: 'new_trade',
      content: `New trade proposal for "${requestedItems[0].title}" from ${req.user.username}`,
      link: `/trades/${trade._id}`,
      relatedId: trade._id
    });

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.getTrades = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;
    const filter = {
      $or: [{ initiator: userId }, { receiver: userId }],
    };
    if (status) filter.status = status;

    const trades = await Trade.find(filter)
      .populate('initiator', 'username trustScore profilePic')
      .populate('receiver', 'username trustScore profilePic')
      .populate('offeredItems', 'title images swapPointValue category')
      .populate('requestedItems', 'title images swapPointValue category')
      .sort({ createdAt: -1 });

    res.json(trades);
  } catch (err) {
    next(err);
  }
};

exports.getTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate('initiator', 'username trustScore profilePic')
      .populate('receiver', 'username trustScore profilePic')
      .populate('offeredItems')
      .populate('requestedItems');

    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    const userId = req.user._id.toString();
    if (trade.initiator._id.toString() !== userId && trade.receiver._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this trade' });
    }

    res.json(trade);
  } catch (err) {
    next(err);
  }
};

exports.updateTradeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const trade = await Trade.findById(req.params.id)
      .populate('initiator', 'username email')
      .populate('receiver', 'username email');

    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    const userId = req.user._id.toString();
    const isInitiator = trade.initiator._id.toString() === userId;
    const isReceiver = trade.receiver._id.toString() === userId;

    if (!isInitiator && !isReceiver) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // State machine validation
    const validTransitions = {
      pending: {
        accepted: () => isReceiver,
        cancelled: () => isInitiator || isReceiver,
      },
      accepted: {
        completed: () => isInitiator || isReceiver,
        cancelled: () => isInitiator || isReceiver,
      },
    };

    const transitions = validTransitions[trade.status];
    if (!transitions || !transitions[status] || !transitions[status]()) {
      return res.status(400).json({
        message: `Cannot transition from "${trade.status}" to "${status}" with your role`,
      });
    }

    trade.status = status;

    // Lock items when trade is accepted
    if (status === 'accepted') {
      await Item.updateMany(
        { _id: { $in: [...trade.offeredItems, ...trade.requestedItems] } },
        { status: 'in_trade' }
      );
      // Notify initiator that their trade was accepted
      await emailService.sendTradeNotification(trade.initiator, trade.receiver, 'accepted');
      await notificationController.createNotification(req.app, {
        recipient: trade.initiator._id,
        sender: trade.receiver._id,
        type: 'trade_update',
        content: `Your trade proposal was accepted by ${trade.receiver.username}`,
        link: `/trades/${trade._id}`,
        relatedId: trade._id
      });
    }

    // Mark items as swapped when completed
    if (status === 'completed') {
      trade.completedAt = new Date();
      await Item.updateMany(
        { _id: { $in: [...trade.offeredItems, ...trade.requestedItems] } },
        { status: 'swapped' }
      );
      // Notify other user
      const notifier = isInitiator ? trade.initiator : trade.receiver;
      const notified = isInitiator ? trade.receiver : trade.initiator;
      await emailService.sendTradeNotification(notified, notifier, 'completed');
      
      await notificationController.createNotification(req.app, {
        recipient: notified._id,
        sender: notifier._id,
        type: 'trade_update',
        content: `Trade completed! Please rate your experience with ${notifier.username}`,
        link: `/trades/${trade._id}`,
        relatedId: trade._id
      });

      // Update user stats
      const users = await User.find({ _id: { $in: [trade.initiator._id, trade.receiver._id] } });
      for (let u of users) {
        u.completedTrades += 1;
        u.trustScore = calculateTrustScore(u);
        await u.save();
      }
    }

    // Release items when cancelled
    if (status === 'cancelled') {
      await Item.updateMany(
        { _id: { $in: [...trade.offeredItems, ...trade.requestedItems] }, status: 'in_trade' },
        { status: 'available' }
      );
      
      // Penalty for cancellation if it was already accepted
      if (trade.status === 'accepted') {
        const canceller = await User.findById(userId);
        canceller.cancelledTrades += 1;
        canceller.trustScore = calculateTrustScore(canceller);
        await canceller.save();
      }
    }

    await trade.save();

    const populated = await Trade.findById(trade._id)
      .populate('initiator', 'username trustScore profilePic')
      .populate('receiver', 'username trustScore profilePic')
      .populate('offeredItems')
      .populate('requestedItems');

    res.json(populated);
  } catch (err) {
    next(err);
  }
};

exports.rateTrade = async (req, res, next) => {
  try {
    const { score, comment } = req.body;
    const trade = await Trade.findById(req.params.id);

    if (!trade) return res.status(404).json({ message: 'Trade not found' });
    if (trade.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed trades' });
    }

    const userId = req.user._id.toString();
    const isInitiator = trade.initiator.toString() === userId;
    const isReceiver = trade.receiver.toString() === userId;

    if (!isInitiator && !isReceiver) {
      return res.status(403).json({ message: 'Not authorized to rate this trade' });
    }

    const ratedUserId = isInitiator ? trade.receiver : trade.initiator;

    // Check for duplicate rating
    const existing = await Rating.findOne({ trade: trade._id, rater: req.user._id });
    if (existing) {
      return res.status(409).json({ message: 'You have already rated this trade' });
    }

    const rating = await Rating.create({
      trade: trade._id,
      rater: req.user._id,
      ratedUser: ratedUserId,
      score,
      comment: comment || '',
    });

    // Recalculate trust score
    const ratedUser = await User.findById(ratedUserId);
    ratedUser.totalRatings += 1;
    ratedUser.ratingSum += score;
    ratedUser.trustScore = calculateTrustScore(ratedUser);
    await ratedUser.save();

    await notificationController.createNotification(req.app, {
      recipient: ratedUserId,
      sender: req.user._id,
      type: 'new_rating',
      content: `${req.user.username} gave you a ${score}-star rating`,
      link: `/profile`,
      relatedId: trade._id
    });

    res.status(201).json(rating);
  } catch (err) {
    next(err);
  }
};
