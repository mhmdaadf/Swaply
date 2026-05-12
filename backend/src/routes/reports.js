const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const protect = require('../middleware/auth');

// Create a report (Any authenticated user)
router.post('/', protect, reportController.createReport);

// Get all reports (Admin only - internal check in controller)
router.get('/', protect, reportController.getReports);

// Update report (Admin only)
router.patch('/:id', protect, reportController.updateReportStatus);

module.exports = router;
