const express = require('express');
const router = express.Router();
const trades = require('../controllers/tradeController');
const protect = require('../middleware/auth');

router.post('/', protect, trades.createTrade);
router.get('/', protect, trades.getTrades);
router.get('/:id', protect, trades.getTrade);
router.patch('/:id/status', protect, trades.updateTradeStatus);
router.post('/:id/rate', protect, trades.rateTrade);

module.exports = router;
