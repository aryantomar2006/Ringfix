const Complaint = require('../models/Complaint');
const User = require('../models/User');
const notifications = require('./notification.service');
const { STATUS, ROLES, MAX_ESCALATION_LEVEL } = require('../config/constants');

const HOUR = 60 * 60 * 1000;

/**
 * Scans unresolved complaints past their SLA deadline.
 *  - flags them as overdue (SLA tracking)
 *  - escalates: bumps escalationLevel at most once per 24h, notifies admins (escalation system)
 */
async function scanAndEscalate() {
  const now = new Date();
  const overdue = await Complaint.find({
    status: { $ne: STATUS.RESOLVED },
    slaDueAt: { $lt: now },
  });
  if (!overdue.length) return { flagged: 0, escalated: 0 };

  const admins = await User.find({ role: ROLES.ADMIN, isActive: true });
  let escalated = 0;

  for (const c of overdue) {
    const firstTime = !c.isOverdue;
    c.isOverdue = true;

    const dueForEscalation =
      c.escalationLevel < MAX_ESCALATION_LEVEL &&
      (!c.escalatedAt || now - c.escalatedAt >= 24 * HOUR);

    if (dueForEscalation) {
      c.escalationLevel += 1;
      c.escalatedAt = now;
      c.statusHistory.push({
        status: c.status,
        note: `Auto-escalated to level ${c.escalationLevel} (SLA breached)`,
      });
      escalated += 1;
      const msg = `SLA breached: ${c.ticketId} "${c.title}" escalated to level ${c.escalationLevel}.`;
      admins.forEach((a) => notifications.notify({ userId: a._id, complaint: c, type: 'ESCALATED', message: msg }));
      if (c.assignedTo) notifications.notify({ userId: c.assignedTo, complaint: c, type: 'OVERDUE', message: msg });
    } else if (firstTime && c.assignedTo) {
      notifications.notify({
        userId: c.assignedTo,
        complaint: c,
        type: 'OVERDUE',
        message: `Reminder: ${c.ticketId} is overdue.`,
      });
    }
    await c.save();
  }
  return { flagged: overdue.length, escalated };
}

module.exports = { scanAndEscalate };
