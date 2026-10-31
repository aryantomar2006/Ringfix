import { useEffect, useState } from 'react';
import { opsApi } from '../api/services';
import { StatCard } from '../components/Badges';
import { catLabel } from '../utils/format';

// Public Transparency Portal: no login required
export default function Transparency() {
  const [s, setS] = useState(null);
  useEffect(() => { opsApi.publicStats().then(setS).catch(() => {}); }, []);
  if (!s) return <p className="muted center">Loading…</p>;

  return (
    <>
      <h2>Live city transparency</h2>
      <div className="stats">
        <StatCard label="Total complaints" value={s.total} />
        <StatCard label="Resolved" value={s.resolved} tone="good" hint={`${s.resolutionRate}% resolution rate`} />
        <StatCard label="Pending" value={s.pending} />
        <StatCard label="Avg resolution time" value={s.avgResolutionHours ? `${s.avgResolutionHours}h` : '-'} />
      </div>
      <div className="card">
        <h3>By category</h3>
        {s.byCategory.map((c) => {
          const pct = c.total ? Math.round((c.resolved / c.total) * 100) : 0;
          return (
            <div key={c.category} className="bar-row">
              <span className="bar-label">{catLabel(c.category)}</span>
              <div className="bar"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
              <span className="muted small">{c.resolved}/{c.total} resolved</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
