import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import { Login, Register } from './pages/AuthPages';
import NewComplaint from './pages/NewComplaint';
import Dashboard from './pages/Dashboard';
import ComplaintDetail from './pages/ComplaintDetail';
import Transparency from './pages/Transparency';
import HeatmapPage from './pages/HeatmapPage';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/transparency" element={<Transparency />} />

            <Route element={<ProtectedRoute roles={['citizen']} />}>
              <Route path="/my-complaints" element={<Dashboard />} />
              <Route path="/new" element={<NewComplaint />} />
            </Route>

            <Route element={<ProtectedRoute roles={['staff', 'admin']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/heatmap" element={<HeatmapPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/complaints/:id" element={<ComplaintDetail />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
