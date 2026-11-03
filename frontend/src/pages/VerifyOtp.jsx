import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/services';

const COOLDOWN = 60; // seconds, matches the backend resend cooldown

export default function VerifyOtp() {
  const { verifyOtp } = useAuth();
  const nav = useNavigate();
  const { state } = useLocation();
  const email = state?.email;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(COOLDOWN);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  // Opened directly without going through sign-up/login
  if (!email) {
    return (
      <div className="card form narrow">
        <h2>Verify your email</h2>
        <p className="muted">Start by <Link to="/register">signing up</Link> or <Link to="/login">logging in</Link>.</p>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setInfo('');
    try {
      await verifyOtp({ email, otp });
      nav('/my-complaints', { replace: true });
    } catch (err) {
      setError(err.details ? err.details.map((d) => d.message).join(', ') : err.message);
    } finally { setBusy(false); }
  };

  const resend = async () => {
    setError(''); setInfo('');
    try {
      await authApi.resendOtp({ email });
      setInfo('A new code has been sent.');
      setOtp('');
      setWait(COOLDOWN);
    } catch (err) { setError(err.message); }
  };

  return (
    <form className="card form narrow" onSubmit={submit}>
      <h2>Verify your email</h2>
      <p className="muted small">We sent a 6-digit code to <b>{email}</b>. It expires in 10 minutes.</p>
      {error && <div className="alert">{error}</div>}
      {info && <div className="alert ok-alert">{info}</div>}
      <label>Verification code
        <input
          ref={inputRef}
          className="otp-input"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          pattern="\d{6}"
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="••••••"
        />
      </label>
      <button className="btn" disabled={busy || otp.length !== 6}>{busy ? 'Verifying…' : 'Verify & continue'}</button>
      <button type="button" className="btn ghost" disabled={wait > 0} onClick={resend}>
        {wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}
      </button>
      <p className="muted small">Wrong email? <Link to="/register">Start over</Link></p>
    </form>
  );
}
