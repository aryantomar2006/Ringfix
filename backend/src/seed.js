// Usage: npm run seed  -> creates demo admin, staff, citizen and sample complaints
import connectDB from './config/db.js';
import User from './models/User.js';
import Complaint from './models/Complaint.js';
import { SLA_HOURS } from './config/constants.js';

const HOUR = 3600 * 1000;

(async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Complaint.deleteMany({})]);

  const [admin, staff, citizen] = await Promise.all([
    User.create({ name: 'The Ringmaster', email: 'admin@ringfix.test', password: 'Admin@123', role: 'admin' }),
    User.create({ name: 'Roadie Rick', email: 'staff@ringfix.test', password: 'Staff@123', role: 'staff', department: 'Roads' }),
    User.create({ name: 'Acrobat Anya', email: 'citizen@ringfix.test', password: 'Citizen@123', role: 'citizen', phone: '9876543210' }),
  ]);

  const samples = [
    ['Pothole on Main Pathway', 'road_damage', 'high', 'Main Pathway', 26.8467, 80.9462, 'OPEN', -60],
    ['Water leaking near caravan 12', 'water_leakage', 'critical', 'Caravan Lane', 26.8480, 80.9475, 'IN_PROGRESS', -10],
    ['Garbage pile behind the big top', 'garbage', 'medium', 'Big Top Square', 26.8455, 80.9490, 'OPEN', -5],
    ['Broken lamp post at Tent Row', 'electricity', 'low', 'Tent Row', 26.8470, 80.9440, 'RESOLVED', -90],
  ];

  let n = 1;
  for (const [title, category, urgency, area, lat, lng, status, createdOffsetH] of samples) {
    const createdAt = new Date(Date.now() + createdOffsetH * HOUR);
    await Complaint.create({
      ticketId: `RF-SEED-${1000 + n++}`,
      title, description: `${title}. Please look into this at the earliest.`,
      category, urgency, area, status,
      location: { type: 'Point', coordinates: [lng, lat], address: area },
      citizen: citizen._id,
      assignedTo: status === 'OPEN' ? undefined : staff._id,
      createdAt,
      slaDueAt: new Date(createdAt.getTime() + SLA_HOURS[urgency] * HOUR),
      resolvedAt: status === 'RESOLVED' ? new Date(createdAt.getTime() + 30 * HOUR) : undefined,
      statusHistory: [{ status: 'OPEN', changedBy: citizen._id, note: 'Complaint submitted', at: createdAt }],
    });
  }

  console.log('Seeded. Logins: admin@ringfix.test / Admin@123, staff@ringfix.test / Staff@123, citizen@ringfix.test / Citizen@123');
  process.exit(0);
})();
