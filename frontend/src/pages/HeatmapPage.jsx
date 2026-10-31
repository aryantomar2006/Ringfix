import { useEffect, useState } from 'react';
import { opsApi } from '../api/services';
import HeatmapView from '../components/HeatmapView';

export default function HeatmapPage() {
  const [points, setPoints] = useState([]);
  useEffect(() => { opsApi.heatmap().then(setPoints).catch(() => {}); }, []);
  return (
    <>
      <h2>Complaint density heatmap</h2>
      <p className="muted">Unresolved complaints clustered by location. Hotter = more complaints.</p>
      {points.length === 0 ? <p className="muted">No geotagged complaints yet.</p> : <HeatmapView points={points} />}
    </>
  );
}
