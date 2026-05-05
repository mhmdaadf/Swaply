const Message = require('../models/Message');
const Trade = require('../models/Trade');

exports.getMessages = async (req, res, next) => {
  try {
    const trade = await Trade.findById(req.params.tradeId);
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    const userId = req.user._id.toString();
    if (trade.initiator.toString() !== userId && trade.receiver.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ trade: req.params.tradeId })
      .populate('sender', 'username profilePic')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const trade = await Trade.findById(req.params.tradeId);
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    const userId = req.user._id.toString();
    if (trade.initiator.toString() !== userId && trade.receiver.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to send messages here' });
    }

    if (trade.status === 'completed' || trade.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot send messages in a closed trade' });
    }

    const message = await Message.create({
      trade: req.params.tradeId,
      sender: req.user._id,
      content,
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'username profilePic');

    // Emit via Socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.to(`trade_${req.params.tradeId}`).emit('new_message', populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};
