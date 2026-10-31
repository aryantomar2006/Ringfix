const Complaint = require('../models/Complaint');
const { STATUS } = require('../config/constants');

// Public transparency stats: resolved vs pending, average resolution time
async function publicStats() {
  const [byStatus, resolution, byCategory, overdue] = await Promise.all([
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.aggregate([
      { $match: { status: STATUS.RESOLVED, resolvedAt: { $exists: true } } },
      { $group: { _id: null, avgMs: { $avg: { $subtract: ['$resolvedAt', '$createdAt'] } } } },
    ]),
    Complaint.aggregate([
      { $group: { _id: '$category', total: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', STATUS.RESOLVED] }, 1, 0] } } } },
      { $sort: { total: -1 } },
    ]),
    Complaint.countDocuments({ isOverdue: true, status: { $ne: STATUS.RESOLVED } }),
  ]);

  const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
  byStatus.forEach((s) => { counts[s._id] = s.count; });
  const total = counts.OPEN + counts.IN_PROGRESS + counts.RESOLVED;

  return {
    total,
    resolved: counts.RESOLVED,
    pending: counts.OPEN + counts.IN_PROGRESS,
    byStatus: counts,
    overdue,
    avgResolutionHours: resolution[0] ? Number((resolution[0].avgMs / 3600000).toFixed(1)) : null,
    resolutionRate: total ? Number(((counts.RESOLVED / total) * 100).toFixed(1)) : 0,
    byCategory: byCategory.map((c) => ({ category: c._id, total: c.total, resolved: c.resolved })),
  };
}

// Heatmap: bucket complaint coordinates into ~100m cells, return [lat, lng, weight]
async function heatmap({ includeResolved = false } = {}) {
  const match = { 'location.coordinates.0': { $exists: true } };
  if (!includeResolved) match.status = { $ne: STATUS.RESOLVED };

  const cells = await Complaint.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, 3] },
          lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, 3] },
        },
        count: { $sum: 1 },
      },
    },
  ]);
  return cells.map((c) => ({ lat: c._id.lat, lng: c._id.lng, weight: c.count }));
}

// Density by locality (area name) for the staff dashboard
async function areaDensity() {
  return Complaint.aggregate([
    { $group: { _id: '$area', total: { $sum: 1 }, pending: { $sum: { $cond: [{ $ne: ['$status', STATUS.RESOLVED] }, 1, 0] } } } },
    { $sort: { pending: -1 } },
    { $limit: 15 },
    { $project: { _id: 0, area: '$_id', total: 1, pending: 1 } },
  ]);
}

module.exports = { publicStats, heatmap, areaDensity };
