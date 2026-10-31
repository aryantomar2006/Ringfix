import asyncHandler from '../utils/asyncHandler.js';
import * as complaintService from '../services/complaint.service.js';
import * as mediaService from '../services/media.service.js';

export const create = asyncHandler(async (req, res) => {
  // Body is already validated; only now do we spend a Cloudinary upload
  const media = await mediaService.uploadMany(req.files);
  try {
    const complaint = await complaintService.create(req.user._id, req.body, media);
    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    await mediaService.removeMany(media); // don't leave orphaned files
    throw err;
  }
});

export const list = asyncHandler(async (req, res) => {
  const result = await complaintService.list(req.query, req.user);
  res.json({ success: true, data: result });
});

export const getOne = asyncHandler(async (req, res) => {
  const complaint = await complaintService.getById(req.params.id, req.user);
  res.json({ success: true, data: complaint });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const complaint = await complaintService.updateStatus(req.params.id, req.body, req.user);
  res.json({ success: true, data: complaint });
});

export const assign = asyncHandler(async (req, res) => {
  const complaint = await complaintService.assign(req.params.id, req.body.staffId, req.user);
  res.json({ success: true, data: complaint });
});
