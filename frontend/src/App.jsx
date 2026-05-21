import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NavBar from './components/NavBar';
import Matches from './pages/Matches';
import Explore from './pages/Explore';
import Projects from './pages/Projects';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

function AuthHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('github_token', token);
      // Clean the URL so the token doesn't stay in browser history
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <AuthHandler />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
