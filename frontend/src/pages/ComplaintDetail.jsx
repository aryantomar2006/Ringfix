import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { complaintApi, opsApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, UrgencyBadge } from '../components/Badges';
import { NEXT_STATUS, STATUS_LABEL, catLabel, fmtDate, timeLeft } from '../utils/format';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isStaff = user.role !== 'citizen';
  const [c, setC] = useState(null);
  const [staff, setStaff] = useState([]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => complaintApi.get(id).then(setC).catch((e) => setError(e.message)), [id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (isStaff) opsApi.staff().then(setStaff).catch(() => {}); }, [isStaff]);

  const act = async (fn) => { setError(''); try { await fn(); setNote(''); await load(); } catch (e) { setError(e.message); } };

  if (error && !c) return <div className="alert">{error}</div>;
  if (!c) return <p className="muted center">Loading…</p>;

  const next = NEXT_STATUS[c.status];
  const sla = timeLeft(c.slaDueAt, c.status);
  const canAdvance = next && (user.role === 'admin' || c.assignedTo?._id === user._id);

  return (
    <div className="detail">
      <div className="card">
        <div className="row between">
          <h2>{c.title}</h2>
          <div className="row"><UrgencyBadge urgency={c.urgency} /><StatusBadge status={c.status} /></div>
        </div>
        <p className="muted small">{c.ticketId} · {catLabel(c.category)} · {c.area}{c.location?.address ? ` (${c.location.address})` : ''}</p>
        <p>{c.description}</p>
        {c.media?.length > 0 && (
          <div className="photos">
            {c.media.map((m) => (m.resourceType === 'video'
              ? <video key={m.publicId} src={m.url} controls preload="metadata" />
              : <a key={m.publicId} href={m.url} target="_blank" rel="noreferrer"><img src={m.url} alt="complaint" /></a>))}
          </div>
        )}
        <div className="meta">
          <span>Reported by <b>{c.citizen?.name}</b> on {fmtDate(c.createdAt)}</span>
          <span>Assigned to <b>{c.assignedTo?.name || 'nobody yet'}</b></span>
          {sla && <span>SLA: <b className={sla.late ? 'late' : 'ok'}>{sla.text}</b> (due {fmtDate(c.slaDueAt)})</span>}
          {c.escalationLevel > 0 && <span className="late">Escalation level {c.escalationLevel}</span>}
          {c.resolvedAt && <span>Resolved {fmtDate(c.resolvedAt)}</span>}
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      {isStaff && (
        <div className="card">
          <h3>Actions</h3>
          <div className="row wrap">
            <select defaultValue="" onChange={(e) => e.target.value && act(() => complaintApi.assign(c._id, e.target.value))}>
              <option value="">{c.assignedTo ? 'Reassign to…' : 'Assign to…'}</option>
              {staff.map((s) => <option key={s._id} value={s._id}>{s.name}{s.department ? ` (${s.department})` : ''}</option>)}
            </select>
            {canAdvance && (
              <>
                <input placeholder="Optional note for the citizen" value={note} onChange={(e) => setNote(e.target.value)} />
                <button className="btn" onClick={() => act(() => complaintApi.updateStatus(c._id, { status: next, note }))}>
                  Mark {STATUS_LABEL[next]}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <h3>Timeline</h3>
        <ol className="timeline">
          {[...c.statusHistory].reverse().map((h, i) => (
            <li key={i}>
              <StatusBadge status={h.status} /> <span className="muted small">{fmtDate(h.at)}{h.changedBy ? ` · ${h.changedBy.name}` : ''}</span>
              {h.note && <div>{h.note}</div>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
