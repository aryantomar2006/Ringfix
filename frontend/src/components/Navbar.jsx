import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { opsApi } from '../api/services';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return undefined;
    const load = () => opsApi.notifications().then((n) => { setItems(n); setUnread(n.filter((x) => !x.read).length); }).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [user]);

  const toggle = async () => {
    setOpen((o) => !o);
    if (!open && unread) { await opsApi.markAllRead(); setUnread(0); }
  };

  const home = user?.role === 'citizen' ? '/my-complaints' : '/dashboard';

  return (
    <header className="nav">
      <Link to="/" className="brand">🎪 RingFix</Link>
      <nav>
        <NavLink to="/transparency">Live stats</NavLink>
        {user && <NavLink to={home}>{user.role === 'citizen' ? 'My complaints' : 'Dashboard'}</NavLink>}
        {user?.role === 'citizen' && <NavLink to="/new">Report issue</NavLink>}
        {user && user.role !== 'citizen' && <NavLink to="/heatmap">Heatmap</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="nav-right">
        {user ? (
          <>
            <div className="bell-wrap">
              <button className="icon-btn" onClick={toggle} aria-label="Notifications">
                🔔{unread > 0 && <span className="dot">{unread}</span>}
              </button>
              {open && (
                <div className="dropdown">
                  {items.length === 0 && <p className="muted">No notifications</p>}
                  {items.slice(0, 8).map((n) => <p key={n._id} className="note">{n.message}</p>)}
                </div>
              )}
            </div>
            <span className="who">{user.name} · {user.role}</span>
            <button className="btn ghost" onClick={() => { logout(); nav('/login'); }}>Logout</button>
          </>
        ) : (
          <>
            <Link className="btn ghost" to="/login">Login</Link>
            <Link className="btn" to="/register">Sign up</Link>
          </>
        )}
      </div>
    </header>
  );
}
