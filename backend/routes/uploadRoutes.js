const express = require('express');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const router = express.Router();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// File upload route
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Determine general file type from mimetype
    let fileType = 'document';
    const mime = req.file.mimetype || '';
    if (mime.startsWith('image/')) {
      fileType = 'image';
    } else if (mime.startsWith('video/')) {
      fileType = 'video';
    }

    // Cloudinary returns the secure_url in req.file.path (or req.file.secure_url)
    const url = req.file.path || req.file.secure_url;
    console.log('File uploaded successfully to Cloudinary:', url);

    res.json({
      url: url,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      fileType: fileType
    });
  } catch (error) {
    console.error('File upload error caught in route:', error);
    res.status(500).json({ error: 'File upload failed: ' + error.message });
  }
});

module.exports = router;
