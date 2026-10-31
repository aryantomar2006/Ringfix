import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintApi, opsApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Filters from '../components/Filters';
import ComplaintTable from '../components/ComplaintTable';
import Pager from '../components/Pager';
import { StatCard } from '../components/Badges';
import { saveBlob } from '../utils/format';

// One page, two roles: citizens see their own complaints, staff/admin see the municipal dashboard.
export default function Dashboard() {
  const { user } = useAuth();
  const isStaff = user.role !== 'citizen';
  const [filters, setFilters] = useState({ page: 1, limit: 15 });
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [stats, setStats] = useState(null);
  const [areas, setAreas] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    complaintApi.list(filters).then(setData).catch((e) => setError(e.message));
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    opsApi.publicStats().then(setStats).catch(() => {});
    if (isStaff) opsApi.areaDensity().then(setAreas).catch(() => {});
  }, [isStaff]);

  const exportReport = async (kind) => {
    const { page, limit, ...rest } = filters; // eslint-disable-line no-unused-vars
    const blob = await opsApi.download(kind, rest);
    saveBlob(blob, `ringfix-report.${kind}`);
  };

  return (
    <>
      <div className="row between">
        <h2>{isStaff ? 'Municipal dashboard' : 'My complaints'}</h2>
        <div className="row">
          <button className="btn ghost" onClick={() => exportReport('csv')}>⬇ CSV</button>
          <button className="btn ghost" onClick={() => exportReport('pdf')}>⬇ PDF</button>
          {!isStaff && <Link className="btn" to="/new">+ New complaint</Link>}
        </div>
      </div>

      {isStaff && stats && (
        <div className="stats">
          <StatCard label="Open + in progress" value={stats.pending} />
          <StatCard label="Resolved" value={stats.resolved} tone="good" />
          <StatCard label="Overdue (SLA)" value={stats.overdue} tone="bad" />
          <StatCard label="Avg resolution" value={stats.avgResolutionHours ? `${stats.avgResolutionHours}h` : '-'} />
        </div>
      )}

      {isStaff && areas.length > 0 && (
        <div className="card">
          <h3>Hotspot localities</h3>
          <div className="chips">{areas.slice(0, 8).map((a) => (
            <button key={a.area} className="chip" onClick={() => setFilters({ ...filters, area: a.area, page: 1 })}>{a.area} · {a.pending} pending</button>
          ))}</div>
        </div>
      )}

      <Filters value={filters} onChange={setFilters} showOverdue={isStaff} />
      {error && <div className="alert">{error}</div>}
      <ComplaintTable items={data.items} showCitizen={isStaff} />
      <Pager page={data.page} pages={data.pages} onChange={(p) => setFilters({ ...filters, page: p })} />
    </>
  );
}
