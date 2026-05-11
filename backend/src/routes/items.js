const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const items = require('../controllers/itemController');
const protect = require('../middleware/auth');
const { storage: cloudinaryStorage } = require('../config/cloudinary');

// Use Cloudinary if configured, otherwise use disk storage (fallback)
const isCloudinaryConfigured = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME;

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: isCloudinaryConfigured ? cloudinaryStorage : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files (jpg, png, webp) are allowed'));
  },
});

router.get('/', items.getItems);
router.get('/my', protect, items.getMyItems);
router.post('/', protect, upload.array('images', 5), items.createItem);
router.post('/estimate', protect, items.estimateItemValue);
router.get('/:id', items.getItem);
router.put('/:id', protect, items.updateItem);
router.delete('/:id', protect, items.deleteItem);

module.exports = router;
