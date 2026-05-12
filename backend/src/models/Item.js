const mongoose = require('mongoose');

const CATEGORIES = [
  'Electronics', 'Books', 'Clothing', 'Furniture', 'Sports',
  'Toys', 'Music', 'Art', 'Tools', 'Automotive', 'Collectibles', 'Other',
];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    default: '',
    maxlength: 1000,
  },
  images: [{
    type: String,
  }],
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: CATEGORIES,
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: CONDITIONS,
  },
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
    min: 0,
  },
  ageMonths: {
    type: Number,
    default: 0,
    min: 0,
  },
  swapPointValue: {
    type: Number,
    default: 0,
  },
  desiredItems: [{
    type: String,
    trim: true,
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'in_trade', 'swapped', 'pending_review', 'flagged'],
    default: 'available',
  },
  moderationRisk: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  moderationFlags: [String],
  moderationReasoning: String,
  moderationSuggestions: String,
}, { timestamps: true });

itemSchema.index({ owner: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ status: 1 });
itemSchema.index({ title: 'text', description: 'text', desiredItems: 'text' });

module.exports = mongoose.model('Item', itemSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.CONDITIONS = CONDITIONS;
