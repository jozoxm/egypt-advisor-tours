import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import './AdminLogin.css';

const AdminPanel = lazy(() => import('./AdminPanel'));

const API_URL = process.env.REACT_APP_API_URL || '';

// Standalone admin layout — rendered at /admin, entirely outside the public App
// layout so there is no duplicate navbar, footer, or Trip Tailor modal.
function AdminRoute() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState('checking'); // 'checking' | 'authenticated' | 'unauthenticated'

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/verify`, {
        credentials: 'include',
      });
      if (res.ok) {
        setAuthState('authenticated');
      } else {
        setAuthState('unauthenticated');
      }
    } catch {
      setAuthState('unauthenticated');
    }
  }, [API_URL]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/admin/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
    setAuthState('unauthenticated');
  };

  if (authState === 'checking') {
    return <div className="admin-loading">Checking session…</div>;
  }

  if (authState === 'unauthenticated') {
    return (
      <AdminLogin onLoginSuccess={() => setAuthState('authenticated')} />
    );
  }

  return (
    <div className="App">
      {/* Always solid navbar — admin has no hero behind it */}
      <nav className="navbar scrolled">
        <div className="nav-container">
          <Link to="/" className="logo-link">
            <img src="/Gold Logo.png?v=5" alt="Egypt Advisor Tours" className="logo-image" />
          </Link>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="contact-btn" onClick={() => navigate('/')}>
              ← Back to Website
            </button>
            <button className="contact-btn" onClick={handleLogout} style={{ background: '#dc2626' }}>
              Log Out
            </button>
          </div>
        </div>
      </nav>
      <Suspense fallback={<div className="admin-loading">Loading admin panel…</div>}>
        <AdminPanel />
      </Suspense>
    </div>
  );
}

export default AdminRoute;
