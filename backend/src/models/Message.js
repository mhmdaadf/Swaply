const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  trade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: 2000,
  },
  readAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

messageSchema.index({ trade: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
