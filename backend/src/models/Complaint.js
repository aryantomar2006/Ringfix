const mongoose = require('mongoose');
const { STATUS, CATEGORIES, URGENCY } = require('../config/constants');

const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: Object.values(STATUS), required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, trim: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    urgency: { type: String, enum: URGENCY, default: 'medium', index: true },
    area: { type: String, required: true, trim: true, index: true }, // e.g. "Caravan Lane"
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined }, // [lng, lat]
      address: { type: String, trim: true },
    },
    photos: [{ type: String }],
    status: { type: String, enum: Object.values(STATUS), default: STATUS.OPEN, index: true },
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    statusHistory: [historySchema],

    // SLA + escalation
    slaDueAt: { type: Date, index: true },
    isOverdue: { type: Boolean, default: false, index: true },
    escalationLevel: { type: Number, default: 0 },
    escalatedAt: { type: Date },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

complaintSchema.index({ 'location.coordinates': '2dsphere' }, { sparse: true });
complaintSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Complaint', complaintSchema);
