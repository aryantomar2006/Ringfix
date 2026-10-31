import asyncHandler from '../utils/asyncHandler.js';
import * as analytics from '../services/analytics.service.js';
import * as reports from '../services/report.service.js';
import * as notifications from '../services/notification.service.js';
import * as authService from '../services/auth.service.js';
import User from '../models/User.js';
import { scanAndEscalate } from '../services/sla.service.js';

export const publicStats = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await analytics.publicStats() });
});

export const heatmap = asyncHandler(async (req, res) => {
  const includeResolved = req.query.includeResolved === 'true';
  res.json({ success: true, data: await analytics.heatmap({ includeResolved }) });
});

export const areaDensity = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await analytics.areaDensity() });
});

export const exportCsv = asyncHandler(async (req, res) => {
  const csv = await reports.buildCsv(req.query, req.user);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="ringfix-report.csv"');
  res.send(csv);
});

export const exportPdf = asyncHandler(async (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="ringfix-report.pdf"');
  await reports.streamPdf(req.query, req.user, res);
});

export const myNotifications = asyncHandler(async (req, res) => {
  const items = await notifications.listForUser(req.user._id, { unreadOnly: req.query.unread === 'true' });
  res.json({ success: true, data: items });
});

export const markNotificationsRead = asyncHandler(async (req, res) => {
  await notifications.markRead(req.user._id, req.params.id);
  res.json({ success: true });
});

// Admin: user management
export const listStaff = asyncHandler(async (_req, res) => {
  const staff = await User.find({ role: { $in: ['staff', 'admin'] }, isActive: true }).sort('name');
  res.json({ success: true, data: staff });
});

export const createStaff = asyncHandler(async (req, res) => {
  const user = await authService.createPrivilegedUser(req.body);
  res.status(201).json({ success: true, data: user });
});

// Admin: trigger SLA scan on demand
export const runSlaScan = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await scanAndEscalate() });
});
