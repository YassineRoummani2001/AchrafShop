const express  = require('express');
const router   = express.Router();
const path     = require('path');
const upload   = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');

/**
 * @desc    Upload a single image (admin only)
 * @route   POST /api/upload
 * @access  Admin
 */
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // Build the public URL
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    url: fileUrl,
    filename: req.file.filename,
  });
});

module.exports = router;
