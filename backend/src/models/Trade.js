const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  offeredItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  }],
  requestedItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending',
  },
  completedAt: {
    type: Date,
  },
}, { timestamps: true });

tradeSchema.index({ initiator: 1 });
tradeSchema.index({ receiver: 1 });
tradeSchema.index({ status: 1 });

module.exports = mongoose.model('Trade', tradeSchema);
