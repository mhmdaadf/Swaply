const express = require('express');
const router = express.Router();
const matches = require('../controllers/matchController');
const protect = require('../middleware/auth');

router.get('/', protect, matches.getMatches);

module.exports = router;
