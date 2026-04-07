import React, { lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminPanel = lazy(() => import('./AdminPanel'));

// Standalone admin layout — rendered at /admin, entirely outside the public App
// layout so there is no duplicate navbar, footer, or Trip Tailor modal.
function AdminRoute() {
  const navigate = useNavigate();
  return (
    <div className="App">
      {/* Always solid navbar — admin has no hero behind it */}
      <nav className="navbar scrolled">
        <div className="nav-container">
          <Link to="/" className="logo-link">
            <img src="/Gold Logo.png?v=5" alt="Egypt Advisor Tours" className="logo-image" />
          </Link>
          <button className="contact-btn" onClick={() => navigate('/')}>
            ← Back to Website
          </button>
        </div>
      </nav>
      <Suspense fallback={<div className="admin-loading">Loading admin panel…</div>}>
        <AdminPanel />
      </Suspense>
    </div>
  );
}

export default AdminRoute;
