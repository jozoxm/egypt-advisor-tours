import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import { DataProvider } from './context/DataContext';

// AdminRoute is loaded lazily so it is excluded from the main bundle.
// It is registered here (outside App) so /admin never mounts the public-site
// layout (navbar, footer, TripTailor modal).
const AdminRoute = lazy(() => import('./pages/AdminRoute'));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin"
          element={
            <Suspense fallback={<div className="admin-loading">Loading admin panel…</div>}>
              <AdminRoute />
            </Suspense>
          }
        />
        {/* All other routes are handled by the public-site App layout */}
        <Route
          path="/*"
          element={
            <DataProvider>
              <App />
            </DataProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
