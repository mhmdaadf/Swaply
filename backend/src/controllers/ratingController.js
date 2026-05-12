const Rating = require('../models/Rating');

exports.getUserRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ ratedUser: req.params.userId })
      .populate('rater', 'username profilePic isVerified')
      .sort({ createdAt: -1 });
    
    // Calculate distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => {
      if (distribution[r.score] !== undefined) distribution[r.score]++;
    });

    res.json({
      ratings,
      distribution,
      total: ratings.length
    });
  } catch (err) {
    next(err);
  }
};

exports.getRatingDetail = async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.id)
      .populate('rater', 'username profilePic')
      .populate('trade');
    if (!rating) return res.status(404).json({ message: 'Rating not found' });
    res.json(rating);
  } catch (err) {
    next(err);
  }
};
