const Item = require('../models/Item');
const { estimateValue, estimateValueSync } = require('../services/valueEstimator');
const { getWizardResponse } = require('../services/listingWizard');

// Parse desiredItems from multipart form data (may arrive as JSON string or comma-separated)
function parseDesiredItems(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(s => s.trim()).filter(Boolean);
  if (typeof raw === 'string') {
    try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) return parsed; } catch { }
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

exports.createItem = async (req, res, next) => {
  try {
    const { title, description, category, condition, originalPrice, ageMonths, desiredItems } = req.body;

    // Use AI-powered estimation with full item context
    const estimation = await estimateValue({ category, originalPrice, condition, ageMonths, title, description });
    const swapPointValue = estimation.swapPointValue;

    const item = await Item.create({
      title,
      description,
      images: req.files ? req.files.map(f => f.path) : [],
      category,
      condition,
      originalPrice,
      ageMonths: ageMonths || 0,
      swapPointValue,
      desiredItems: parseDesiredItems(desiredItems),
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
      // Use sync heuristic for quick edits to avoid API latency
      updates.swapPointValue = estimateValueSync({
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

exports.estimateItemValue = async (req, res, next) => {
  try {
    const { category, originalPrice, condition, ageMonths, title, description, itemId } = req.body;
    
    // Find up to 3 similar items (excluding the current one) to provide as internal context
    const query = { category, status: 'available' };
    if (itemId) query._id = { $ne: itemId };

    const similarItems = await Item.find(query)
    .sort({ createdAt: -1 })
    .limit(3)
    .select('title swapPointValue condition');

    const internalListings = similarItems.map(item => ({
      title: item.title,
      value: item.swapPointValue,
      condition: item.condition
    }));

    const estimation = await estimateValue({ 
      category, originalPrice, condition, ageMonths, title, description,
      internalListings // Pass internal data to AI
    });

    // Apply Trust Penalty: low honesty = lower valuation
    let finalValue = estimation.swapPointValue;
    const honesty = estimation.honestyScore ?? 1.0;
    if (honesty < 0.9) {
      // Penalty scales: 50% honesty → ~25% reduction, 30% → ~50% reduction
      const penalty = 1 - ((1 - honesty) * 0.7);
      finalValue = Math.round(finalValue * penalty);
    }

    res.json({
      swapPointValue: finalValue,
      reasoning: estimation.reasoning,
      method: estimation.method,
      confidence: estimation.confidence ?? null,
      honestyScore: honesty,
      redFlags: estimation.redFlags ?? [],
      baseline: estimation.baseline ?? null,
      internalComparison: internalListings // Send back for UI display
    });
  } catch (err) {
    next(err);
  }
};

exports.wizardChat = async (req, res, next) => {
  try {
    const { messages, currentData } = req.body;
    const response = await getWizardResponse(messages, currentData);
    res.json(response);
  } catch (err) {
    next(err);
  }
};
