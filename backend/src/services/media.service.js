import { v2 as cloudinary } from 'cloudinary';
import ApiError from '../utils/ApiError.js';
import { cloudinary as cfg } from '../config/env.js';

let configured = false;
function ensureConfigured() {
  if (configured) return;
  if (!cfg.cloudName || !cfg.apiKey || !cfg.apiSecret) {
    throw new ApiError(500, 'Media storage is not configured (missing CLOUDINARY_* env vars)');
  }
  cloudinary.config({ cloud_name: cfg.cloudName, api_key: cfg.apiKey, api_secret: cfg.apiSecret, secure: true });
  configured = true;
}

function uploadOne(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: cfg.folder, resource_type: file.kind }, // 'image' | 'video'
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );
    stream.end(file.buffer);
  });
}

// Uploads all files in parallel; if any fails, removes the ones that succeeded
async function uploadMany(files = []) {
  if (!files.length) return [];
  ensureConfigured();
  const settled = await Promise.allSettled(files.map(uploadOne));
  const ok = settled.filter((s) => s.status === 'fulfilled').map((s) => s.value);
  const failed = settled.find((s) => s.status === 'rejected');
  if (failed) {
    await removeMany(ok);
    console.error('Cloudinary upload failed:', failed.reason?.message);
    throw new ApiError(502, 'Could not upload media, please try again');
  }
  return ok;
}

async function removeMany(media = []) {
  try {
    ensureConfigured();
    await Promise.all(
      media.map((m) => cloudinary.uploader.destroy(m.publicId, { resource_type: m.resourceType || 'image' }))
    );
  } catch (err) {
    console.error('Cloudinary cleanup failed:', err.message);
  }
}

export { uploadMany, removeMany };
