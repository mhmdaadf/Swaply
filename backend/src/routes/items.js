const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const items = require('../controllers/itemController');
const protect = require('../middleware/auth');

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', items.getItems);
router.get('/my', protect, items.getMyItems);
router.get('/user/:userId', items.getUserItems);
router.post('/', protect, upload.array('images', 5), items.createItem);
router.post('/estimate', protect, items.estimateItemValue);
router.post('/wizard-chat', protect, items.wizardChat);
router.post('/analyze-moderation', protect, items.analyzeModeration);
router.get('/:id', items.getItem);
router.put('/:id', protect, items.updateItem);
router.delete('/:id', protect, items.deleteItem);

module.exports = router;
