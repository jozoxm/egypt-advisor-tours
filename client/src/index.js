import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import { DataProvider } from './context/DataContext';

// /admin is handled by the Express server, which redirects editors to the
// configured Storyblok space. Any direct navigation bypasses the React router.

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
