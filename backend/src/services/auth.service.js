const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const { ROLES } = require('../config/constants');

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

module.exports = { register, login, createPrivilegedUser };
