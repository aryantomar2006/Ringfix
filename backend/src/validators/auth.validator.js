import Joi from 'joi';

// Check email format only. Joi's default also requires a registered public TLD,
// which rejects valid addresses on internal/new domains (e.g. admin@ringfix.test).
const email = () => Joi.string().trim().email({ tlds: { allow: false } }).lowercase();

export const register = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: email().required(),
  phone: Joi.string().trim().pattern(/^[0-9+\-\s]{7,15}$/).allow('', null),
  password: Joi.string().min(6).max(72).required(),
});

export const login = Joi.object({
  email: email().required(),
  password: Joi.string().required(),
});

export const createStaff = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: email().required(),
  phone: Joi.string().trim().allow('', null),
  password: Joi.string().min(6).max(72).required(),
  role: Joi.string().valid('staff', 'admin').default('staff'),
  department: Joi.string().trim().allow('', null),
});

export const verifyOtp = Joi.object({
  email: email().required(),
  otp: Joi.string().pattern(/^\d{6}$/).required().messages({ 'string.pattern.base': 'Code must be 6 digits' }),
});

export const resendOtp = Joi.object({
  email: email().required(),
});
