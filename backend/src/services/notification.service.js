import nodemailer from 'nodemailer';
import { smtp } from '../config/env.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

let transporter = null;
if (smtp.host && smtp.user) {
  transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
  });
}

async function sendEmail(to, subject, text) {
  if (!transporter) {
    console.log(`[email:stub] to=${to} | ${subject} | ${text}`);
    return;
  }
  try {
    await transporter.sendMail({ from: smtp.from, to, subject, text });
  } catch (err) {
    console.error('Email failed:', err.message);
  }
}

// Plug in Twilio / MSG91 here. Stubbed so the app runs without credentials.
async function sendSms(phone, text) {
  if (!phone) return;
  console.log(`[sms:stub] to=${phone} | ${text}`);
}

/**
 * Creates an in-app (push) notification and fans out email + SMS.
 * Never throws: notification failures must not break the main flow.
 */
async function notify({ userId, complaint, type, message }) {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    await Notification.create({ user: user._id, complaint: complaint?._id, type, message });
    const subject = `RingFix: ${complaint?.ticketId || 'Update'}`;
    await Promise.all([sendEmail(user.email, subject, message), sendSms(user.phone, message)]);
  } catch (err) {
    console.error('notify failed:', err.message);
  }
}

async function listForUser(userId, { unreadOnly = false } = {}) {
  const filter = { user: userId, ...(unreadOnly && { read: false }) };
  return Notification.find(filter).sort('-createdAt').limit(50).populate('complaint', 'ticketId title');
}

async function markRead(userId, id) {
  const filter = id ? { _id: id, user: userId } : { user: userId, read: false };
  return Notification.updateMany(filter, { read: true });
}

export { notify, listForUser, markRead, sendEmail };
