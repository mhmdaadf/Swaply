const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const protect = require('../middleware/auth');
const { admin, superAdmin } = require('../middleware/admin');

// All routes here require admin privileges
router.use(protect);
router.use(admin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/toggle', adminController.toggleUserStatus);
router.get('/listings', adminController.getListings);
router.patch('/listings/:id', adminController.updateListingStatus);
router.get('/moderation-queue', adminController.getModerationQueue);
router.get('/trades', adminController.getTrades);
router.post('/users/:id/verify', adminController.verifyUser);

module.exports = router;
