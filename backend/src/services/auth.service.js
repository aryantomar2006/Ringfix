import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { jwtSecret, jwtExpiresIn } from '../config/env.js';
import { ROLES } from '../config/constants.js';

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });

async function register(data) {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw ApiError.conflict('Email already registered');
  // Public registration always creates a citizen
  const user = await User.create({ ...data, role: ROLES.CITIZEN });
  return { user, token: signToken(user) };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) throw ApiError.forbidden('Account disabled');
  return { user, token: signToken(user) };
}

// Admin-only: create staff/admin accounts
async function createPrivilegedUser(data) {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw ApiError.conflict('Email already registered');
  return User.create(data);
}

export { register, login, createPrivilegedUser };
