const express = require('express');
const router = express.Router();
const messages = require('../controllers/messageController');
const protect = require('../middleware/auth');

router.get('/:tradeId/messages', protect, messages.getMessages);
router.post('/:tradeId/messages', protect, messages.sendMessage);

module.exports = router;
