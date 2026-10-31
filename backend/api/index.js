// Vercel serverless entry: every request is rewritten here (see vercel.json)
import connectDB from '../src/config/db.js';
import app from '../src/app.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    return res.status(503).json({ success: false, message: 'Database unavailable' });
  }
  return app(req, res);
}
