import { useCallback, useEffect, useState } from 'react';
import { opsApi } from '../api/services';

export default function Admin() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff', department: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = useCallback(() => opsApi.staff().then(setStaff).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);

  const create = async (e) => {
    e.preventDefault(); setError(''); setMsg('');
    try {
      await opsApi.createStaff(form);
      setForm({ name: '', email: '', password: '', role: 'staff', department: '' });
      setMsg('Account created'); load();
    } catch (err) { setError(err.details ? err.details.map((d) => d.message).join(', ') : err.message); }
  };

  const scan = async () => {
    const r = await opsApi.runSla();
    setMsg(`SLA scan done: ${r.flagged} overdue, ${r.escalated} escalated`);
  };

  return (
    <>
      <div className="row between">
        <h2>Admin</h2>
        <button className="btn ghost" onClick={scan}>Run SLA scan now</button>
      </div>
      {msg && <div className="alert ok-alert">{msg}</div>}
      {error && <div className="alert">{error}</div>}
      <div className="grid2">
        <form className="card form" onSubmit={create}>
          <h3>Add staff / admin</h3>
          <label>Name<input required value={form.name} onChange={set('name')} /></label>
          <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
          <label>Temp password<input type="password" minLength={6} required value={form.password} onChange={set('password')} /></label>
          <div className="grid2">
            <label>Role<select value={form.role} onChange={set('role')}><option value="staff">Staff</option><option value="admin">Admin</option></select></label>
            <label>Department<input value={form.department} onChange={set('department')} placeholder="Roads, Water…" /></label>
          </div>
          <button className="btn">Create account</button>
        </form>
        <div className="card">
          <h3>Team ({staff.length})</h3>
          {staff.map((s) => (
            <div key={s._id} className="team-row"><b>{s.name}</b> <span className="badge">{s.role}</span> <span className="muted small">{s.department || ''} · {s.email}</span></div>
          ))}
        </div>
      </div>
    </>
  );
}
