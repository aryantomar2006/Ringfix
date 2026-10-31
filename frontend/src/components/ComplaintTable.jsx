import { Link } from 'react-router-dom';
import { StatusBadge, UrgencyBadge } from './Badges';
import { catLabel, fmtDate, timeLeft } from '../utils/format';

export default function ComplaintTable({ items, showCitizen }) {
  if (!items.length) return <p className="muted center">No complaints found.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ticket</th><th>Issue</th><th>Type</th><th>Area</th><th>Urgency</th><th>Status</th>
            {showCitizen && <th>Assigned</th>}<th>SLA</th><th>Created</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => {
            const sla = timeLeft(c.slaDueAt, c.status);
            return (
              <tr key={c._id}>
                <td><Link to={`/complaints/${c._id}`}>{c.ticketId}</Link></td>
                <td>{c.title}{c.escalationLevel > 0 && <span className="badge esc" title="Escalated">▲{c.escalationLevel}</span>}</td>
                <td>{catLabel(c.category)}</td>
                <td>{c.area}</td>
                <td><UrgencyBadge urgency={c.urgency} /></td>
                <td><StatusBadge status={c.status} /></td>
                {showCitizen && <td>{c.assignedTo?.name || <span className="muted">Unassigned</span>}</td>}
                <td>{sla ? <span className={sla.late ? 'late' : 'ok'}>{sla.text}</span> : '-'}</td>
                <td>{fmtDate(c.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
