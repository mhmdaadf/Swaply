const Item = require('../models/Item');
const { estimateValue } = require('../services/valueEstimator');

exports.createItem = async (req, res, next) => {
  try {
    const { title, description, category, condition, originalPrice, ageMonths, desiredItems } = req.body;

    const swapPointValue = estimateValue({ category, originalPrice, condition, ageMonths });

    const item = await Item.create({
      title,
      description,
      images: req.files ? req.files.map(f => `/uploads/${f.filename}`) : [],
      category,
      condition,
      originalPrice,
      ageMonths: ageMonths || 0,
      swapPointValue,
      desiredItems: desiredItems || [],
      owner: req.user._id,
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.getItems = async (req, res, next) => {
  try {
    const { category, condition, search, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (status) filter.status = status;
    else filter.status = 'available';

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('owner', 'username trustScore profilePic')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Item.countDocuments(filter),
    ]);

    res.json({
      items,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
    });
  } catch (err) {
    next(err);
  }
};

exports.getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'username trustScore profilePic email');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }
    if (item.status === 'in_trade') {
      return res.status(400).json({ message: 'Cannot edit an item that is currently in a trade' });
    }

    const updates = req.body;
    if (updates.originalPrice || updates.condition || updates.category || updates.ageMonths) {
      updates.swapPointValue = estimateValue({
        category: updates.category || item.category,
        originalPrice: updates.originalPrice || item.originalPrice,
        condition: updates.condition || item.condition,
        ageMonths: updates.ageMonths ?? item.ageMonths,
      });
    }

    Object.assign(item, updates);
    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }
    if (item.status === 'in_trade') {
      return res.status(400).json({ message: 'Cannot delete an item that is currently in a trade' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
};

exports.estimateItemValue = async (req, res) => {
  const { category, originalPrice, condition, ageMonths } = req.body;
  const value = estimateValue({ category, originalPrice, condition, ageMonths });
  res.json({ swapPointValue: value });
};
