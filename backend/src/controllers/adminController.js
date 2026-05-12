const User = require('../models/User');
const Item = require('../models/Item');
const Trade = require('../models/Trade');
const Report = require('../models/Report');

exports.getStats = async (req, res, next) => {
  try {
    const [userCount, itemCount, tradeCount, pendingReports] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Trade.countDocuments(),
      Report.countDocuments({ status: 'Pending' })
    ]);

    res.json({
      users: userCount,
      items: itemCount,
      trades: tradeCount,
      pendingReports
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    next(err);
  }
};

exports.getListings = async (req, res, next) => {
  try {
    const items = await Item.find().populate('owner', 'username email').sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.updateListingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const item = await Item.findById(req.params.id).populate('owner');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    const oldStatus = item.status;
    item.status = status;
    await item.save();

    // Trust Score Integration: If flagged, penalize owner
    if (status === 'flagged' && oldStatus !== 'flagged') {
      const owner = await User.findById(item.owner._id);
      if (owner) {
        // High penalty for fraudulent items (-10 trust points)
        owner.trustScore = Math.max(0, owner.trustScore - 10);
        await owner.save();
      }
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.getTrades = async (req, res, next) => {
  try {
    const trades = await Trade.find()
      .populate('initiator', 'username')
      .populate('receiver', 'username')
      .sort({ createdAt: -1 });
    res.json(trades);
  } catch (err) {
    next(err);
  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = true;
    await user.save();
    res.json({ message: 'User verified successfully', user });
  } catch (err) {
    next(err);
  }
};

exports.getModerationQueue = async (req, res, next) => {
  try {
    const items = await Item.find({ status: 'pending_review' })
      .populate('owner', 'username trustScore profilePic')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};
