const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'new_trade', 
      'trade_update', 
      'new_message', 
      'new_rating', 
      'report_update',
      'ai_match'
    ],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  link: {
    type: String // URL to redirect when clicked
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId // Trade ID, Item ID, etc.
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
