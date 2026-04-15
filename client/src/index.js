import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import { DataProvider } from './context/DataContext';

// /admin is now served by Payload CMS (a Next.js app) and proxied from the
// Express server — it is no longer part of the React bundle.  Any direct
// navigation to /admin goes straight through to the Payload admin panel via
// the server-level proxy, bypassing the React router entirely.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* All public-site routes are handled by the App layout */}
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
