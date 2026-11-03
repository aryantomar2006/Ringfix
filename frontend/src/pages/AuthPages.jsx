import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const u = await login(form);
      nav(u.role === 'citizen' ? '/my-complaints' : '/dashboard');
    } catch (err) {
      // Account exists but email not verified: a fresh code was just sent
      if (err.details?.needsVerification) nav('/verify', { state: { email: err.details.email || form.email } });
      else setError(err.message);
    } finally { setBusy(false); }
  };

  return (
    <form className="card form narrow" onSubmit={submit}>
      <h2>Welcome back</h2>
      {error && <div className="alert">{error}</div>}
      <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Login'}</button>
      <p className="muted small">New citizen? <Link to="/register">Create an account</Link></p>
    </form>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { const r = await register(form); nav('/verify', { state: { email: r.email } }); }
    catch (err) {
      setError(err.details ? err.details.map((d) => d.message).join(', ') : err.message);
    } finally { setBusy(false); }
  };

  return (
    <form className="card form narrow" onSubmit={submit}>
      <h2>Join the Circus</h2>
      {error && <div className="alert">{error}</div>}
      <label>Full name<input required value={form.name} onChange={set('name')} /></label>
      <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
      <label>Phone (for SMS updates)<input value={form.phone} onChange={set('phone')} /></label>
      <label>Password<input type="password" minLength={6} required value={form.password} onChange={set('password')} /></label>
      <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Sign up'}</button>
      <p className="muted small">Already registered? <Link to="/login">Login</Link></p>
    </form>
  );
}
