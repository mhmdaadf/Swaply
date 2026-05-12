const Report = require('../models/Report');
const notificationController = require('./notificationController');

exports.createReport = async (req, res, next) => {
  try {
    const { targetType, targetId, category, reason } = req.body;
    const reporterId = req.user._id;

    // Check if reporter is reporting themselves
    if (targetType === 'User' && reporterId.toString() === targetId) {
      return res.status(400).json({ message: 'Cannot report yourself' });
    }

    const report = await Report.create({
      reporter: reporterId,
      targetType,
      targetId,
      category,
      reason
    });

    res.status(201).json({
      message: 'Report submitted successfully. Our moderation team will review it.',
      report
    });
  } catch (err) {
    next(err);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    // Admin only check should be in middleware, but double check here if needed
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const reports = await Report.find(filter)
      .populate('reporter', 'username email')
      .populate({
        path: 'targetId',
        select: 'username title title description' // Basic info depending on type
      })
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    next(err);
  }
};

exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (status) report.status = status;
    report.adminNotes = adminNotes;
    await report.save();

    await notificationController.createNotification(req.app, {
      recipient: report.reporter,
      type: 'report_update',
      content: `Update on your report: Status changed to ${status}`,
      link: '/profile' // or a specific report view if we had one
    });

    res.json(report);
  } catch (err) {
    next(err);
  }
};
