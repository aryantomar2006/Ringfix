const Joi = require('joi');
const { CATEGORIES, URGENCY, STATUS } = require('../config/constants');

exports.create = Joi.object({
  title: Joi.string().trim().min(3).max(120).required(),
  description: Joi.string().trim().min(10).max(2000).required(),
  category: Joi.string().valid(...CATEGORIES).required(),
  urgency: Joi.string().valid(...URGENCY).default('medium'),
  area: Joi.string().trim().min(2).max(100).required(),
  address: Joi.string().trim().max(200).allow('', null),
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
}).and('lat', 'lng');

exports.list = Joi.object({
  status: Joi.string().valid(...Object.values(STATUS)),
  category: Joi.string().valid(...CATEGORIES),
  urgency: Joi.string().valid(...URGENCY),
  area: Joi.string().trim(),
  assignedTo: Joi.string().hex().length(24),
  overdue: Joi.boolean(),
  q: Joi.string().trim().max(100),
  from: Joi.date().iso(),
  to: Joi.date().iso(),
  sort: Joi.string().valid('createdAt', '-createdAt', 'urgency', '-urgency', 'slaDueAt', '-slaDueAt').default('-createdAt'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

exports.updateStatus = Joi.object({
  status: Joi.string().valid(...Object.values(STATUS)).required(),
  note: Joi.string().trim().max(500).allow('', null),
});

exports.assign = Joi.object({
  staffId: Joi.string().hex().length(24).required(),
});
