const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const protect = require('../middleware/auth');

// Publicly accessible for profiles
router.get('/user/:userId', ratingController.getUserRatings);

// Specific detail (might need auth)
router.get('/:id', ratingController.getRatingDetail);

module.exports = router;
