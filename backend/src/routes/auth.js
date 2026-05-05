const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const protect = require('../middleware/auth');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/refresh', auth.refresh);
router.get('/me', protect, auth.getMe);

module.exports = router;
