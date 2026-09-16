const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');
const env = require('../config/env');

/**
 * Multer configuration for file uploads.
 * Stores files to disk (development) — swap to S3 for production.
 */

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../', env.UPLOAD_DIR));
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId-timestamp-originalname
    const uniqueName = `${req.user._id}-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File filter — only allow PDF and DOCX
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF and DOCX files are allowed', 400), false);
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(env.MAX_FILE_SIZE, 10), // 5MB default
    files: 1, // Single file per request
  },
});

module.exports = upload;
