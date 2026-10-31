const asyncHandler = require('../utils/asyncHandler');
const analytics = require('../services/analytics.service');
const reports = require('../services/report.service');
const notifications = require('../services/notification.service');
const authService = require('../services/auth.service');
const User = require('../models/User');
const { scanAndEscalate } = require('../services/sla.service');

exports.publicStats = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await analytics.publicStats() });
});

exports.heatmap = asyncHandler(async (req, res) => {
  const includeResolved = req.query.includeResolved === 'true';
  res.json({ success: true, data: await analytics.heatmap({ includeResolved }) });
});

exports.areaDensity = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await analytics.areaDensity() });
});

exports.exportCsv = asyncHandler(async (req, res) => {
  const csv = await reports.buildCsv(req.query, req.user);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="ringfix-report.csv"');
  res.send(csv);
});

exports.exportPdf = asyncHandler(async (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="ringfix-report.pdf"');
  await reports.streamPdf(req.query, req.user, res);
});

exports.myNotifications = asyncHandler(async (req, res) => {
  const items = await notifications.listForUser(req.user._id, { unreadOnly: req.query.unread === 'true' });
  res.json({ success: true, data: items });
});

exports.markNotificationsRead = asyncHandler(async (req, res) => {
  await notifications.markRead(req.user._id, req.params.id);
  res.json({ success: true });
});

// Admin: user management
exports.listStaff = asyncHandler(async (_req, res) => {
  const staff = await User.find({ role: { $in: ['staff', 'admin'] }, isActive: true }).sort('name');
  res.json({ success: true, data: staff });
});

exports.createStaff = asyncHandler(async (req, res) => {
  const user = await authService.createPrivilegedUser(req.body);
  res.status(201).json({ success: true, data: user });
});

// Admin: trigger SLA scan on demand
exports.runSlaScan = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await scanAndEscalate() });
});
