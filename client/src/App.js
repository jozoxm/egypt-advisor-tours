import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import About from './pages/About';
import BlogsPage from './pages/BlogsPage';
import TourDetail from './pages/TourDetail';
import HomePage from './pages/HomePage';
import ToursPage from './pages/ToursPage';
import TailorTripModal from './components/TailorTripModal';
import ErrorBoundary from './components/ErrorBoundary';
import useTitle from './hooks/useTitle';
import { useData } from './context/DataContext';

// App version for cache busting - increment when Admin button issues occur
const APP_VERSION = '1.0.3';
const MAX_SCROLL_RETRY_ATTEMPTS = 10;
const SCROLL_RETRY_DELAY_MS = 50;

function App() {
  const { tours, testimonials, contactInfo, blogs, siteSettings, loading } = useData();
  const toursLoading = loading.tours;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tourSearch, setTourSearch] = useState('');
  const [showTripTailor, setShowTripTailor] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const scrollTimeoutsRef = useRef([]);

  // Set page title based on current route (individual pages override this via useTitle)
  const routeTitles = { '/tours': 'All Tours', '/': null };
  useTitle(routeTitles[location.pathname] ?? null);

  const clearScrollTimeouts = () => {
    scrollTimeoutsRef.current.forEach((id) => clearTimeout(id));
    scrollTimeoutsRef.current = [];
  };

  const scrollToSectionWithRetry = (sectionId, remainingAttempts = MAX_SCROLL_RETRY_ATTEMPTS) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      clearScrollTimeouts();
      return;
    }
    if (remainingAttempts > 0) {
      clearScrollTimeouts();
      const timeoutId = setTimeout(
        () => scrollToSectionWithRetry(sectionId, remainingAttempts - 1),
        SCROLL_RETRY_DELAY_MS
      );
      scrollTimeoutsRef.current.push(timeoutId);
    }
  };

useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 50);
  };
  window.addEventListener('scroll', handleScroll);
  console.log(`🎨 Egypt Advisor Tours - Version ${APP_VERSION}`);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

useEffect(() => {
  return () => {
    clearScrollTimeouts();
  };
}, []);

  // Data is loaded from DataContext (DataProvider wraps the app in index.js).
  // Admin panel changes are reflected immediately without a rebuild.

  const normalizedSearch = tourSearch.trim().toLowerCase();
  const filteredTours = tours.filter((tour) => {
    if (!normalizedSearch) return true;
    const searchable = `${tour.name} ${tour.description} ${tour.duration} ${tour.price} ${tour.groupSize}`.toLowerCase();
    return searchable.includes(normalizedSearch);
  });

  const scrollToTripTailor = () => {
    setShowTripTailor(true);
    setMenuOpen(false);
  };

  const goToSection = (sectionId) => {
    setMenuOpen(false);
    if (document.getElementById(sectionId)) {
      scrollToSectionWithRetry(sectionId);
      return;
    }

    if (location.pathname !== '/') {
      navigate('/');
    }
    const timeoutId = setTimeout(
      () => scrollToSectionWithRetry(sectionId),
      SCROLL_RETRY_DELAY_MS * 2
    );
    scrollTimeoutsRef.current.push(timeoutId);
  };

  return (
    <div className="App">
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="logo-link" onClick={() => { setMenuOpen(false); }}>
            <img src="/Gold Logo.png?v=5" alt="Egypt Advisor Tours" className="logo-image" />
          </Link>
          <button 
            className="hamburger" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`}></span>
          </button>
          <ul 
            className={`nav-menu ${menuOpen ? 'mobile-open' : ''}`}
            aria-hidden={!menuOpen}
            inert={!menuOpen ? '' : undefined}
          >
            <li><Link to="/" onClick={() => { setMenuOpen(false); }}>Home</Link></li>
            <li>
              <NavLink
                to="/tours"
                onClick={(e) => {
                  if (location.pathname === '/tours') {
                    e.preventDefault();
                    scrollToSectionWithRetry('tours');
                  }
                  setMenuOpen(false);
                }}
              >
                Tours
              </NavLink>
            </li>
            <li><NavLink to="/blogs" onClick={() => { setMenuOpen(false); }}>Blogs</NavLink></li>
            <li><NavLink to="/about" onClick={() => { setMenuOpen(false); }}>About</NavLink></li>
          </ul>
            <button 
              className="contact-btn"
              onClick={scrollToTripTailor}
            >
              Trip Tailor
            </button>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <HomePage
                siteSettings={siteSettings}
                filteredTours={filteredTours}
                tourSearch={tourSearch}
                setTourSearch={setTourSearch}
                totalTours={tours.length}
                toursLoading={toursLoading}
                blogs={blogs}
                testimonials={testimonials}
                goToSection={goToSection}
                onTailorTrip={scrollToTripTailor}
              />
            </ErrorBoundary>
          }
        />

        <Route
          path="/tours"
          element={
            <ErrorBoundary>
              <ToursPage
                filteredTours={filteredTours}
                tourSearch={tourSearch}
                setTourSearch={setTourSearch}
                totalTours={tours.length}
                toursLoading={toursLoading}
                onTailorTrip={scrollToTripTailor}
                goToSection={goToSection}
              />
            </ErrorBoundary>
          }
        />

        <Route path="/blogs" element={<ErrorBoundary><BlogsPage onTailorTrip={scrollToTripTailor} blogs={blogs} /></ErrorBoundary>} />

        <Route path="/about" element={<ErrorBoundary><About /></ErrorBoundary>} />

        <Route path="/tours/:id" element={<ErrorBoundary><TourDetail /></ErrorBoundary>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <TailorTripModal
        isOpen={showTripTailor}
        onClose={() => setShowTripTailor(false)}
        contactInfo={contactInfo}
      />

      {/* Mobile Trip Tailor Button - Fixed at Bottom */}
      <button 
        className="mobile-inquiry-btn"
        onClick={scrollToTripTailor}
      >
        ✨ Tailor My Trip
      </button>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>{contactInfo.companyName}</h4>
            <p>{contactInfo.companyTagline}</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link
                  to="/tours"
                  onClick={(e) => {
                    if (location.pathname === '/tours') {
                      e.preventDefault();
                      scrollToSectionWithRetry('tours');
                    }
                  }}
                >
                  Tours
                </Link>
              </li>
              <li><Link to="/blogs">Blogs</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Info</h4>
            <p>📧 {contactInfo.emailPrimary}</p>
            <p>📞 {contactInfo.phone}</p>
            <p>📍 {contactInfo.address.fullAddress}</p>
          </div>
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href={contactInfo.socialMedia.facebook}>Facebook</a>
              <a href={contactInfo.socialMedia.instagram}>Instagram</a>
              <a href={contactInfo.socialMedia.twitter}>Twitter</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 {contactInfo.companyName}. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
