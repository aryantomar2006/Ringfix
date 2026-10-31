import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

function HeatLayer({ points }) {
  const map = useMap();
  const layer = useRef(null);

  useEffect(() => {
    if (layer.current) map.removeLayer(layer.current);
    if (!points.length) return undefined;
    const max = Math.max(...points.map((p) => p.weight));
    layer.current = L.heatLayer(points.map((p) => [p.lat, p.lng, p.weight / max]), { radius: 35, blur: 25, maxZoom: 17 }).addTo(map);
    map.fitBounds(points.map((p) => [p.lat, p.lng]), { padding: [40, 40], maxZoom: 16 });
    return () => { if (layer.current) map.removeLayer(layer.current); };
  }, [points, map]);

  return null;
}

export default function HeatmapView({ points, height = 480 }) {
  return (
    <MapContainer center={[26.8467, 80.9462]} zoom={14} style={{ height, borderRadius: 14 }}>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <HeatLayer points={points} />
    </MapContainer>
  );
}
