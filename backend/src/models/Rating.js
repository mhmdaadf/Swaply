const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  trade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade',
    required: true,
  },
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ratedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    default: '',
    maxlength: 500,
  },
}, { timestamps: true });

ratingSchema.index({ trade: 1, rater: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
