import { CATEGORIES, URGENCY } from '../utils/format';

// Search & filtering: type, area, urgency, date (+ status, overdue, text)
export default function Filters({ value, onChange, showOverdue }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value || undefined, page: 1 });
  return (
    <div className="filters">
      <input placeholder="Search text…" value={value.q || ''} onChange={set('q')} />
      <select value={value.category || ''} onChange={set('category')}>
        <option value="">All types</option>
        {CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <select value={value.urgency || ''} onChange={set('urgency')}>
        <option value="">Any urgency</option>
        {URGENCY.map((u) => <option key={u} value={u}>{u}</option>)}
      </select>
      <select value={value.status || ''} onChange={set('status')}>
        <option value="">Any status</option>
        <option value="OPEN">Open</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="RESOLVED">Resolved</option>
      </select>
      <input placeholder="Area" value={value.area || ''} onChange={set('area')} />
      <input type="date" title="From" value={value.from || ''} onChange={set('from')} />
      <input type="date" title="To" value={value.to || ''} onChange={set('to')} />
      {showOverdue && (
        <label className="check">
          <input type="checkbox" checked={value.overdue === 'true'} onChange={(e) => onChange({ ...value, overdue: e.target.checked ? 'true' : undefined, page: 1 })} />
          Overdue only
        </label>
      )}
    </div>
  );
}
