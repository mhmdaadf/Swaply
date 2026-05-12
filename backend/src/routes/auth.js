const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const protect = require('../middleware/auth');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/google-login', auth.googleLogin);
router.post('/refresh', auth.refresh);
router.get('/me', protect, auth.getMe);
router.patch('/profile', protect, auth.updateProfile);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password/:token', auth.resetPassword);
router.get('/users/:id', auth.getUserById);

module.exports = router;
