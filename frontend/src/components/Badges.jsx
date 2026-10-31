import { STATUS_LABEL } from '../utils/format';

export const StatusBadge = ({ status }) => (
  <span className={`badge st-${status}`}>{STATUS_LABEL[status] || status}</span>
);

export const UrgencyBadge = ({ urgency }) => <span className={`badge ug-${urgency}`}>{urgency}</span>;

export const StatCard = ({ label, value, hint, tone }) => (
  <div className={`stat ${tone || ''}`}>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {hint && <div className="muted small">{hint}</div>}
  </div>
);
