import crypto from 'crypto';
import { jwtSecret } from '../config/env.js';

export const OTP_TTL_MS = 10 * 60 * 1000; // code valid for 10 minutes
export const RESEND_COOLDOWN_MS = 60 * 1000; // 1 code per minute per user
export const MAX_ATTEMPTS = 5; // wrong guesses before a new code is required

// Cryptographically secure 6-digit code
export const generateOtp = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');

// Only a keyed hash is stored, never the code itself
export const hashOtp = (email, otp) =>
  crypto.createHmac('sha256', jwtSecret).update(`${email}:${otp}`).digest('hex');

export const safeEqual = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
