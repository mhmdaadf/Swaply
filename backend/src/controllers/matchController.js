const { findMatches } = require('../services/matchEngine');

exports.getMatches = async (req, res, next) => {
  try {
    const matches = await findMatches(req.user._id);
    res.json(matches);
  } catch (err) {
    next(err);
  }
};
