import asyncHandler from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const { email } = await authService.register(req.body);
  res.status(201).json({ success: true, data: { email, message: 'Verification code sent to your email' } });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { user, token } = await authService.verifyOtp(req.body);
  res.json({ success: true, data: { user, token } });
});

export const resendOtp = asyncHandler(async (req, res) => {
  await authService.resendOtp(req.body);
  res.json({ success: true, data: { message: 'If the account exists, a new code has been sent' } });
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.json({ success: true, data: { user, token } });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});
