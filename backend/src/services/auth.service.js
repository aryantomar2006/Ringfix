import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { jwtSecret, jwtExpiresIn } from '../config/env.js';
import { ROLES } from '../config/constants.js';
import { sendEmail } from './notification.service.js';
import {
  OTP_TTL_MS, RESEND_COOLDOWN_MS, MAX_ATTEMPTS, generateOtp, hashOtp, safeEqual,
} from '../utils/otp.js';

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });

// Generates a fresh code, stores its hash, and emails it. Enforces a resend cooldown.
async function issueOtp(user) {
  const now = Date.now();
  if (user.otpSentAt && now - user.otpSentAt.getTime() < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - user.otpSentAt.getTime())) / 1000);
    throw new ApiError(429, `Please wait ${wait}s before requesting another code`);
  }
  const otp = generateOtp();
  user.otpHash = hashOtp(user.email, otp);
  user.otpExpiresAt = new Date(now + OTP_TTL_MS);
  user.otpAttempts = 0;
  user.otpSentAt = new Date(now);
  await user.save();

  await sendEmail(
    user.email,
    'Your RingFix verification code',
    `Your RingFix verification code is ${otp}.\nIt expires in ${OTP_TTL_MS / 60000} minutes. If you did not sign up, ignore this email.`
  );
}

// Step 1: create (or refresh) an UNVERIFIED citizen and email a code. No token yet.
async function register(data) {
  let user = await User.findOne({ email: data.email });
  if (user?.isVerified) throw ApiError.conflict('Email already registered');

  if (user) {
    // Unverified leftover from an earlier attempt: let them retry with new details
    Object.assign(user, { name: data.name, phone: data.phone, password: data.password });
  } else {
    // Public registration always creates a citizen
    user = new User({ ...data, role: ROLES.CITIZEN, isVerified: false });
  }
  await user.save();
  await issueOtp(user);
  return { email: user.email };
}

// Step 2: check the code, mark verified, sign the user in
async function verifyOtp({ email, otp }) {
  const user = await User.findOne({ email }).select('+otpHash');
  if (!user || !user.otpHash) throw ApiError.badRequest('Invalid or expired code');
  if (user.isVerified) throw ApiError.badRequest('Email already verified, please log in');
  if (user.otpExpiresAt < new Date()) throw ApiError.badRequest('Code expired, request a new one');
  if (user.otpAttempts >= MAX_ATTEMPTS) throw new ApiError(429, 'Too many wrong attempts, request a new code');

  if (!safeEqual(user.otpHash, hashOtp(user.email, otp))) {
    user.otpAttempts += 1;
    await user.save();
    throw ApiError.badRequest('Incorrect code');
  }

  user.isVerified = true;
  user.otpHash = undefined;
  user.otpExpiresAt = undefined;
  user.otpAttempts = 0;
  await user.save();
  return { user, token: signToken(user) };
}

// Always resolves quietly so the endpoint can't be used to discover which emails exist
async function resendOtp({ email }) {
  const user = await User.findOne({ email });
  if (user && !user.isVerified) await issueOtp(user);
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) throw ApiError.forbidden('Account disabled');
  if (!user.isVerified) {
    await issueOtp(user).catch(() => {}); // best effort; cooldown may apply
    throw new ApiError(403, 'Please verify your email. We sent you a code.', { needsVerification: true, email: user.email });
  }
  return { user, token: signToken(user) };
}

// Admin-only: create staff/admin accounts (trusted, so pre-verified)
async function createPrivilegedUser(data) {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw ApiError.conflict('Email already registered');
  return User.create({ ...data, isVerified: true });
}

export { register, verifyOtp, resendOtp, login, createPrivilegedUser };
