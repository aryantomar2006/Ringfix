export const CATEGORIES = [
  ['road_damage', 'Road damage'],
  ['water_leakage', 'Water leakage'],
  ['garbage', 'Garbage not collected'],
  ['electricity', 'Electricity'],
  ['sanitation', 'Sanitation'],
  ['other', 'Other'],
];

export const URGENCY = ['low', 'medium', 'high', 'critical'];

export const STATUS_LABEL = { OPEN: 'Open', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved' };
export const NEXT_STATUS = { OPEN: 'IN_PROGRESS', IN_PROGRESS: 'RESOLVED' };

export const catLabel = (key) => CATEGORIES.find(([k]) => k === key)?.[1] || key;

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '-';

export function timeLeft(due, status) {
  if (!due || status === 'RESOLVED') return null;
  const ms = new Date(due) - Date.now();
  const h = Math.abs(Math.round(ms / 3600000));
  const text = h >= 48 ? `${Math.round(h / 24)}d` : `${h}h`;
  return ms < 0 ? { late: true, text: `${text} overdue` } : { late: false, text: `${text} left` };
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
