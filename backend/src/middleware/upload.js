import path from 'path';
import multer from 'multer';
import ApiError from '../utils/ApiError.js';
import { upload } from '../config/env.js';

// Allowlist: MIME type AND file extension must both match (blocks renamed files like evil.exe -> a.png)
const ALLOWED = {
  image: {
    mimes: ['image/jpeg', 'image/png', 'image/webp'],
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
    maxBytes: upload.maxImageBytes,
  },
  video: {
    mimes: ['video/mp4', 'video/webm', 'video/quicktime'],
    exts: ['.mp4', '.webm', '.mov'],
    maxBytes: upload.maxVideoBytes,
  },
};

function kindOf(file) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  return Object.keys(ALLOWED).find(
    (k) => ALLOWED[k].mimes.includes(file.mimetype) && ALLOWED[k].exts.includes(ext)
  );
}

const fileFilter = (_req, file, cb) => {
  if (kindOf(file)) return cb(null, true);
  cb(ApiError.badRequest('Only JPG, PNG, WebP images and MP4, WebM, MOV videos are allowed'));
};

// Memory storage: serverless filesystems are read-only, files go straight to Cloudinary
const parser = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: Math.max(upload.maxImageBytes, upload.maxVideoBytes),
    files: upload.maxFiles,
  },
}).array('media', upload.maxFiles);

// multer only supports one fileSize limit, so enforce per-type limits here and tag each file
const enforceTypeLimits = (req, _res, next) => {
  for (const file of req.files || []) {
    file.kind = kindOf(file);
    const max = ALLOWED[file.kind].maxBytes;
    if (file.size > max) {
      return next(ApiError.badRequest(`${file.originalname}: ${file.kind} must be under ${Math.round(max / 1048576)} MB`));
    }
  }
  next();
};

export const uploadMedia = [parser, enforceTypeLimits];
export { ALLOWED };
