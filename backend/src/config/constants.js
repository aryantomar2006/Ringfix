const ROLES = Object.freeze({ CITIZEN: 'citizen', STAFF: 'staff', ADMIN: 'admin' });

const STATUS = Object.freeze({ OPEN: 'OPEN', IN_PROGRESS: 'IN_PROGRESS', RESOLVED: 'RESOLVED' });

// Ticket lifecycle: OPEN -> IN_PROGRESS -> RESOLVED
const STATUS_TRANSITIONS = Object.freeze({
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: [],
});

const CATEGORIES = Object.freeze([
  'road_damage',
  'water_leakage',
  'garbage',
  'electricity',
  'sanitation',
  'other',
]);

const URGENCY = Object.freeze(['low', 'medium', 'high', 'critical']);

// SLA deadline (hours) per urgency
const SLA_HOURS = Object.freeze({ low: 120, medium: 72, high: 48, critical: 24 });

const MAX_ESCALATION_LEVEL = 3;

export {
  ROLES,
  STATUS,
  STATUS_TRANSITIONS,
  CATEGORIES,
  URGENCY,
  SLA_HOURS,
  MAX_ESCALATION_LEVEL,
};
