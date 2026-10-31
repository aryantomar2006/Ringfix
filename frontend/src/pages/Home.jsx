import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <section className="hero">
      <h1>The Circus of Wonders<br />runs smoothly with <span className="pink">RingFix</span></h1>
      <p>Report broken pathways, leaking caravans and garbage piles. Track every complaint from OPEN → IN PROGRESS → RESOLVED.</p>
      <div className="row center-row">
        {user?.role === 'citizen' && <Link className="btn" to="/new">Report an issue</Link>}
        {!user && <Link className="btn" to="/register">Get started</Link>}
        <Link className="btn ghost" to="/transparency">See live city stats</Link>
      </div>
    </section>
  );
}
