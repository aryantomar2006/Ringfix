const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) return cb(null, true);
  cb(ApiError.badRequest('Only JPEG, PNG or WebP images are allowed'));
};

// Up to 3 photos, 5 MB each
exports.uploadPhotos = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 3 },
}).array('photos', 3);

exports.uploadDir = uploadDir;
