import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import * as notifications from './notification.service.js';
import { STATUS, STATUS_TRANSITIONS, SLA_HOURS, ROLES } from '../config/constants.js';

const HOUR = 60 * 60 * 1000;

function generateTicketId() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RF-${stamp}-${rand}`;
}

async function create(citizenId, data, media = []) {
  const { lat, lng, address, ...rest } = data;
  const complaint = await Complaint.create({
    ...rest,
    ticketId: generateTicketId(),
    citizen: citizenId,
    media,
    ...(lat !== undefined && { location: { type: 'Point', coordinates: [lng, lat], address } }),
    slaDueAt: new Date(Date.now() + SLA_HOURS[rest.urgency || 'medium'] * HOUR),
    statusHistory: [{ status: STATUS.OPEN, changedBy: citizenId, note: 'Complaint submitted' }],
  });
  return complaint;
}

// Build a Mongo filter from validated query params, scoped by the caller's role
function buildFilter(query, user) {
  const filter = {};
  if (user.role === ROLES.CITIZEN) filter.citizen = user._id;
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.urgency) filter.urgency = query.urgency;
  if (query.area) filter.area = new RegExp(query.area.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.overdue !== undefined) filter.isOverdue = query.overdue;
  if (query.q) filter.$text = { $search: query.q };
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = query.from;
    if (query.to) filter.createdAt.$lte = query.to;
  }
  return filter;
}

async function list(query, user) {
  const filter = buildFilter(query, user);
  const { page, limit, sort } = query;
  const [items, total] = await Promise.all([
    Complaint.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('citizen', 'name email')
      .populate('assignedTo', 'name department'),
    Complaint.countDocuments(filter),
  ]);
  return { items, total, page, pages: Math.ceil(total / limit) };
}

async function getById(id, user) {
  const complaint = await Complaint.findById(id)
    .populate('citizen', 'name email phone')
    .populate('assignedTo', 'name department')
    .populate('statusHistory.changedBy', 'name role');
  if (!complaint) throw ApiError.notFound('Complaint not found');
  if (user.role === ROLES.CITIZEN && String(complaint.citizen._id) !== String(user._id)) {
    throw ApiError.forbidden('You can only view your own complaints');
  }
  return complaint;
}

async function updateStatus(id, { status, note }, user) {
  const complaint = await Complaint.findById(id);
  if (!complaint) throw ApiError.notFound('Complaint not found');

  if (user.role === ROLES.STAFF && String(complaint.assignedTo) !== String(user._id)) {
    throw ApiError.forbidden('Complaint is not assigned to you');
  }
  if (!STATUS_TRANSITIONS[complaint.status].includes(status)) {
    throw ApiError.badRequest(`Cannot move from ${complaint.status} to ${status}`);
  }

  complaint.status = status;
  complaint.statusHistory.push({ status, changedBy: user._id, note });
  if (status === STATUS.RESOLVED) {
    complaint.resolvedAt = new Date();
    complaint.isOverdue = false;
  }
  await complaint.save();

  notifications.notify({
    userId: complaint.citizen,
    complaint,
    type: 'STATUS_CHANGE',
    message: `Your complaint ${complaint.ticketId} is now ${status.replace('_', ' ')}.${note ? ` Note: ${note}` : ''}`,
  });
  return complaint;
}

async function assign(id, staffId, user) {
  const staff = await User.findOne({ _id: staffId, role: { $in: [ROLES.STAFF, ROLES.ADMIN] }, isActive: true });
  if (!staff) throw ApiError.badRequest('Invalid staff member');

  const complaint = await Complaint.findById(id);
  if (!complaint) throw ApiError.notFound('Complaint not found');
  if (complaint.status === STATUS.RESOLVED) throw ApiError.badRequest('Complaint already resolved');

  complaint.assignedTo = staff._id;
  complaint.statusHistory.push({
    status: complaint.status,
    changedBy: user._id,
    note: `Assigned to ${staff.name}`,
  });
  await complaint.save();

  notifications.notify({
    userId: staff._id,
    complaint,
    type: 'ASSIGNED',
    message: `You have been assigned complaint ${complaint.ticketId}: ${complaint.title}`,
  });
  return complaint;
}

export { create, list, getById, updateStatus, assign, buildFilter };
