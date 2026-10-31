const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
    type: { type: String, enum: ['STATUS_CHANGE', 'ASSIGNED', 'OVERDUE', 'ESCALATED'], required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
