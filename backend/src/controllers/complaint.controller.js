const asyncHandler = require('../utils/asyncHandler');
const complaintService = require('../services/complaint.service');

exports.create = asyncHandler(async (req, res) => {
  const complaint = await complaintService.create(req.user._id, req.body, req.files);
  res.status(201).json({ success: true, data: complaint });
});

exports.list = asyncHandler(async (req, res) => {
  const result = await complaintService.list(req.query, req.user);
  res.json({ success: true, data: result });
});

exports.getOne = asyncHandler(async (req, res) => {
  const complaint = await complaintService.getById(req.params.id, req.user);
  res.json({ success: true, data: complaint });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const complaint = await complaintService.updateStatus(req.params.id, req.body, req.user);
  res.json({ success: true, data: complaint });
});

exports.assign = asyncHandler(async (req, res) => {
  const complaint = await complaintService.assign(req.params.id, req.body.staffId, req.user);
  res.json({ success: true, data: complaint });
});
