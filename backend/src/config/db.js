import mongoose from 'mongoose';
import { mongoUri } from './env.js';

// Cached across invocations: serverless functions reuse warm containers,
// so we must not open a new connection on every request.
let cached = global.__mongoose;
if (!cached) cached = global.__mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose
      .connect(mongoUri, { serverSelectionTimeoutMS: 10000, maxPoolSize: 5, bufferCommands: false })
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.host}`);
        return m;
      });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // allow retry on next request
    throw err;
  }
  return cached.conn;
}

export default connectDB;
