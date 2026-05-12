const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['User', 'Item', 'Trade'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  category: {
    type: String,
    enum: ['Scam', 'Abuse', 'Fake Item', 'Inappropriate Content', 'Other'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewing', 'Resolved', 'Dismissed'],
    default: 'Pending'
  },
  adminNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
