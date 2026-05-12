const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username profilePic')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

exports.markOneAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    next(err);
  }
};

// Helper for other controllers
exports.createNotification = async (app, data) => {
  try {
    const notification = await Notification.create(data);
    const populated = await Notification.findById(notification._id)
      .populate('sender', 'username profilePic');
    
    const io = app.get('io');
    if (io) {
      io.to(data.recipient.toString()).emit('new_notification', populated);
    }
    return populated;
  } catch (err) {
    console.error('Failed to create notification', err);
  }
};
