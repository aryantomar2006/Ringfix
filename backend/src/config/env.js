import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'];
required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
});

const mb = (v, fallback) => Math.round((Number(v) || fallback) * 1024 * 1024);

export const env = process.env.NODE_ENV || 'development';
export const isVercel = Boolean(process.env.VERCEL);
export const port = Number(process.env.PORT) || 5000;
export const mongoUri = process.env.MONGO_URI;
export const jwtSecret = process.env.JWT_SECRET;
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
// Comma-separated list of allowed frontend origins
export const clientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''));
export const cronSecret = process.env.CRON_SECRET;
export const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
  folder: process.env.CLOUDINARY_FOLDER || 'ringfix',
};
// Vercel serverless request bodies are capped at 4.5 MB, so keep these <= 4
export const upload = {
  maxImageBytes: mb(process.env.MAX_IMAGE_MB, 4),
  maxVideoBytes: mb(process.env.MAX_VIDEO_MB, 4),
  maxFiles: 3,
};
export const smtp = {
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.MAIL_FROM || 'RingFix <no-reply@ringfix.local>',
};
export const slaCron = process.env.SLA_CRON || '*/15 * * * *';
