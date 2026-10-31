import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintApi } from '../api/services';
import { CATEGORIES, URGENCY } from '../utils/format';

const MAX_FILES = 3;
const MAX_MB = 4; // keep in sync with backend MAX_IMAGE_MB / MAX_VIDEO_MB (Vercel body cap is 4.5 MB)
const ACCEPT = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime';

export default function NewComplaint() {
  const nav = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: 'road_damage', urgency: 'medium', area: '', address: '', lat: '', lng: '' });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Early client-side check (the server re-validates type, extension and size)
  const pickFiles = (e) => {
    const picked = Array.from(e.target.files);
    const allowed = ACCEPT.split(',');
    const bad = picked.find((f) => !allowed.includes(f.type) || f.size > MAX_MB * 1024 * 1024);
    if (picked.length > MAX_FILES) setError(`Choose at most ${MAX_FILES} files`);
    else if (bad) setError(`${bad.name}: unsupported type or larger than ${MAX_MB} MB`);
    else setError('');
    if (bad || picked.length > MAX_FILES) { e.target.value = ''; setFiles([]); return; }
    setFiles(picked);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return setError('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (p) => setForm((f) => ({ ...f, lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) })),
      () => setError('Could not get your location')
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
    files.forEach((f) => fd.append('media', f));
    try {
      const c = await complaintApi.create(fd);
      nav(`/complaints/${c._id}`);
    } catch (err) {
      setError(err.details ? err.details.map((d) => d.message).join(', ') : err.message);
    } finally { setBusy(false); }
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Report an issue</h2>
      {error && <div className="alert">{error}</div>}
      <label>Title<input required value={form.title} onChange={set('title')} placeholder="e.g. Pothole near ticket booth" /></label>
      <label>Description<textarea required rows={4} value={form.description} onChange={set('description')} /></label>
      <div className="grid2">
        <label>Type
          <select value={form.category} onChange={set('category')}>
            {CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </label>
        <label>Urgency
          <select value={form.urgency} onChange={set('urgency')}>{URGENCY.map((u) => <option key={u}>{u}</option>)}</select>
        </label>
      </div>
      <div className="grid2">
        <label>Area / locality<input required value={form.area} onChange={set('area')} placeholder="Caravan Lane" /></label>
        <label>Landmark / address<input value={form.address} onChange={set('address')} /></label>
      </div>
      <div className="grid3">
        <label>Latitude<input type="number" step="any" value={form.lat} onChange={set('lat')} /></label>
        <label>Longitude<input type="number" step="any" value={form.lng} onChange={set('lng')} /></label>
        <button type="button" className="btn ghost align-end" onClick={useMyLocation}>📍 Use my location</button>
      </div>
      <label>Photos / videos (up to {MAX_FILES}; JPG, PNG, WebP, MP4, WebM, MOV; max {MAX_MB} MB each)
        <input type="file" accept={ACCEPT} multiple onChange={pickFiles} />
      </label>
      {files.length > 0 && <p className="muted small">{files.map((f) => f.name).join(', ')}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Submitting…' : 'Submit complaint'}</button>
    </form>
  );
}
