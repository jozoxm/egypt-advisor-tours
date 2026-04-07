import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Routes, Route, Link, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import './App.css';
import About from './pages/About';
import BlogsPage from './pages/BlogsPage';
import TourDetail from './pages/TourDetail';
import HomePage from './pages/HomePage';
import ToursPage from './pages/ToursPage';
import useTitle from './hooks/useTitle';
import { tours as defaultTours, testimonials as defaultTestimonials } from './data/tours-data';
import { contactInfo as defaultContactInfo } from './data/contact-info';
import { blogs as defaultBlogs } from './data/blogs-data';
import { siteSettings as defaultSiteSettings } from './data/site-settings';

const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const API_URL = process.env.REACT_APP_API_URL || '';

// App version for cache busting - increment when Admin button issues occur
const APP_VERSION = '1.0.2';
const MAX_SCROLL_RETRY_ATTEMPTS = 10;
const SCROLL_RETRY_DELAY_MS = 50;

// ============================================================
// EmailJS Configuration – Trip Tailor enquiries
// Set these in Vercel project environment variables or .env.production
// ============================================================
const EMAILJS_SERVICE_ID         = process.env.REACT_APP_EMAILJS_SERVICE_ID          || '';
const EMAILJS_TRIPTAILOR_TEMPLATE = process.env.REACT_APP_EMAILJS_TRIPTAILOR_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY         = process.env.REACT_APP_EMAILJS_PUBLIC_KEY           || '';

// Admin layout: minimal navbar (logo + back button) wrapping the lazy AdminPanel.
function AdminRoute() {
  const navigate = useNavigate();
  return (
    <div className="App">
      <nav className="navbar scrolled">{/* always solid — admin has no hero behind the navbar */}
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

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tourSearch, setTourSearch] = useState('');
  const [showTripTailor, setShowTripTailor] = useState(false);
  const [tripTailorSubmitting, setTripTailorSubmitting] = useState(false);
  const [tripTailorMessage, setTripTailorMessage] = useState('');
  const [tours, setTours] = useState(defaultTours);
  const [toursLoading, setToursLoading] = useState(true);
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [contactInfo, setContactInfo] = useState(defaultContactInfo);
  const [blogs, setBlogs] = useState(defaultBlogs);
  const [siteSettings, setSiteSettings] = useState(defaultSiteSettings);
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
    
    // Log version on mount to verify fresh load
    console.log(`🎨 Egypt Advisor Tours - Version ${APP_VERSION}`);
    console.log('Admin button moved to footer');
    
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

useEffect(() => {
  return () => {
    clearScrollTimeouts();
  };
}, []);

useEffect(() => {
  let isMounted = true;

  fetch(`${API_URL}/api/tours`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!isMounted || !data) return;
      if (data.tours) setTours(data.tours);
      if (data.testimonials) setTestimonials(data.testimonials);
    })
    .catch(() => {})
    .finally(() => { if (isMounted) setToursLoading(false); });

  fetch(`${API_URL}/api/contact`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!isMounted || !data) return;
      setContactInfo(data);
    })
    .catch(() => {});

  fetch(`${API_URL}/api/blogs`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!isMounted || !data || !data.blogs) return;
      setBlogs(data.blogs);
    })
    .catch(() => {});

  fetch(`${API_URL}/api/settings`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!isMounted || !data || !data.hero) return;
      setSiteSettings(data);
    })
    .catch(() => {});

  return () => {
    isMounted = false;
  };
}, []);

  // Data is loaded from the API on mount and falls back to static imports.
  // Admin panel changes are reflected immediately without a rebuild.

  const normalizedSearch = tourSearch.trim().toLowerCase();
  const filteredTours = tours.filter((tour) => {
    if (!normalizedSearch) return true;
    const searchable = `${tour.name} ${tour.description} ${tour.duration} ${tour.price} ${tour.groupSize}`.toLowerCase();
    return searchable.includes(normalizedSearch);
  });

  const scrollToTripTailor = () => {
    setShowTripTailor(true);
    setTripTailorMessage('');
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
          }
        />

        <Route
          path="/tours"
          element={
            <ToursPage
              filteredTours={filteredTours}
              tourSearch={tourSearch}
              setTourSearch={setTourSearch}
              totalTours={tours.length}
              toursLoading={toursLoading}
              onTailorTrip={scrollToTripTailor}
              goToSection={goToSection}
            />
          }
        />

        <Route path="/blogs" element={<BlogsPage onTailorTrip={scrollToTripTailor} blogs={blogs} />} />

        <Route path="/about" element={<About />} />

        <Route path="/tours/:id" element={<TourDetail />} />

        <Route path="/admin" element={<AdminRoute />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showTripTailor && (
        <div className="trip-tailor-modal" role="dialog" aria-modal="true" aria-label="Tailor your Egypt trip" onClick={() => setShowTripTailor(false)}>
          <div className="trip-tailor-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowTripTailor(false)} aria-label="Close trip tailor form">✕</button>
            <div className="trip-tailor-grid">
              <div className="trip-tailor-copy">
                <h2>Tailor Your Egypt Journey</h2>
                <p>Share your dream experiences and we'll craft a bespoke itinerary with expert Egyptologists, luxury stays, and seamless logistics.</p>
                <ul className="trip-highlights">
                  <li>✔️ Private guides & skip-the-line access</li>
                  <li>✔️ Handpicked stays in Cairo, Luxor, Aswan & the Red Sea</li>
                  <li>✔️ Flexible pace with cultural, culinary, and family-friendly options</li>
                </ul>
                <div className="trip-contact">
                  <span>📧 {contactInfo.emailPrimary}</span>
                  <span>📞 {contactInfo.phone}</span>
                </div>
              </div>

              <form
                className="trip-tailor-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setTripTailorSubmitting(true);
                  setTripTailorMessage('');

                  const fd = new FormData(e.target);
                  const interests = [
                    fd.get('interestHistory') ? 'Ancient history & temples' : '',
                    fd.get('interestNile') ? 'Nile cruise' : '',
                    fd.get('interestRedSea') ? 'Red Sea beaches & diving' : '',
                    fd.get('interestFood') ? 'Food & culinary' : '',
                    fd.get('interestDesert') ? 'Desert adventures' : '',
                    fd.get('interestFamily') ? 'Family-friendly' : '',
                  ].filter(Boolean).join(', ') || 'Not specified';

                  const templateParams = {
                    full_name:      fd.get('fullName'),
                    email:          fd.get('email'),
                    phone:          fd.get('phone'),
                    whatsapp:       fd.get('whatsapp') ? 'Yes' : 'No',
                    travel_dates:   fd.get('travelDates'),
                    travelers:      fd.get('travelers'),
                    travel_style:   fd.get('travelStyle'),
                    accommodation:  fd.get('accommodation'),
                    interests,
                    pace:           fd.get('pace'),
                    budget:         fd.get('budget'),
                    must_see:       fd.get('mustSee') || 'Not specified',
                    language:       fd.get('language') || 'Not specified',
                    notes:          fd.get('notes'),
                  };

                  if (!EMAILJS_SERVICE_ID || !EMAILJS_TRIPTAILOR_TEMPLATE || !EMAILJS_PUBLIC_KEY) {
                    console.warn('EmailJS is not configured. Set REACT_APP_EMAILJS_SERVICE_ID, REACT_APP_EMAILJS_TRIPTAILOR_TEMPLATE_ID, and REACT_APP_EMAILJS_PUBLIC_KEY.');
                    console.info('Trip Tailor enquiry:', templateParams);
                    setTripTailorMessage('error');
                  } else {
                    try {
                      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TRIPTAILOR_TEMPLATE, templateParams, EMAILJS_PUBLIC_KEY);
                      setTripTailorMessage('success');
                    } catch (err) {
                      console.error('EmailJS error:', err);
                      setTripTailorMessage('error');
                    }
                  }
                  setTripTailorSubmitting(false);
                }}
              >
                <div className="form-row">
                  <input name="fullName" type="text" placeholder="Full Name" aria-label="Full Name" required />
                  <input name="email" type="email" placeholder="Email Address" aria-label="Email Address" required />
                </div>
                <div className="form-row">
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+20 123 456 7890 (WhatsApp)"
                    aria-label="Phone number (international format)"
                    required
                  />
                  <label className="checkbox-item inline-checkbox">
                    <input name="whatsapp" type="checkbox" defaultChecked aria-label="WhatsApp" /> WhatsApp
                  </label>
                </div>
                <div className="form-row">
                  <input
                    name="travelDates"
                    type="text"
                    placeholder="Preferred travel dates or month (e.g., Oct 2026)"
                    aria-label="Preferred travel dates or month"
                    required
                  />
                  <input
                    name="travelers"
                    type="number"
                    min="1"
                    max="50"
                    placeholder="Number of travelers"
                    aria-label="Number of travelers"
                    required
                  />
                </div>
                <div className="form-row">
                  <select
                    name="travelStyle"
                    aria-label="Travel style"
                    defaultValue="placeholder"
                    required
                  >
                    <option value="placeholder" disabled hidden>Travel style</option>
                    <option value="luxury">Luxury & private</option>
                    <option value="cultural">Cultural immersion</option>
                    <option value="adventure">Adventure & outdoors</option>
                    <option value="family">Family friendly</option>
                  </select>
                  <select name="accommodation" aria-label="Accommodation preference" defaultValue="placeholder" required>
                    <option value="placeholder" disabled hidden>Accommodation preference</option>
                    <option value="boutique">Boutique & character stays</option>
                    <option value="luxury-hotels">Luxury hotels & resorts</option>
                    <option value="heritage">Heritage stays & eco-lodges</option>
                    <option value="budget">Comfort/budget friendly</option>
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <span className="field-label">Travel interests (select all that apply)</span>
                  <div className="options-grid spacious-options">
                    <label className="checkbox-item"><input name="interestHistory" type="checkbox" /> Ancient history & temples</label>
                    <label className="checkbox-item"><input name="interestNile" type="checkbox" /> Nile cruise experiences</label>
                    <label className="checkbox-item"><input name="interestRedSea" type="checkbox" /> Red Sea beaches & diving</label>
                    <label className="checkbox-item"><input name="interestFood" type="checkbox" /> Food & culinary tours</label>
                    <label className="checkbox-item"><input name="interestDesert" type="checkbox" /> Desert adventures & oases</label>
                    <label className="checkbox-item"><input name="interestFamily" type="checkbox" /> Family-friendly activities</label>
                  </div>
                </div>
                <div className="form-row">
                  <select name="pace" aria-label="Preferred trip pace" defaultValue="placeholder" required>
                    <option value="placeholder" disabled hidden>Preferred pace</option>
                    <option value="relaxed">Relaxed (more downtime)</option>
                    <option value="balanced">Balanced (mix of sights & rest)</option>
                    <option value="packed">See-it-all (full days)</option>
                  </select>
                  <select name="budget" aria-label="Budget range" defaultValue="placeholder" required>
                    <option value="placeholder" disabled hidden>Budget range</option>
                    <option value="premium">Premium (top-tier)</option>
                    <option value="mid">Mid-range</option>
                    <option value="value">Value-focused</option>
                  </select>
                </div>
                <div className="form-row">
                  <input name="mustSee" type="text" placeholder="Must-see sites (optional, e.g., Giza, Abu Simbel, Nile cruise)" aria-label="Must-see sites (optional)" />
                  <select name="language" aria-label="Guiding language preference" defaultValue="placeholder">
                    <option value="placeholder" disabled hidden>Guiding language (optional)</option>
                    <option value="english">English</option>
                    <option value="arabic">Arabic</option>
                    <option value="french">French</option>
                    <option value="spanish">Spanish</option>
                    <option value="german">German</option>
                    <option value="other">Other (share in notes)</option>
                  </select>
                </div>
                <div className="form-group">
                  <textarea name="notes" placeholder="Tell us about your ideal Egypt trip, interests, and pace." aria-label="Tell us about your ideal Egypt trip, interests, and pace." rows="4" required></textarea>
                </div>
                {tripTailorMessage === 'success' && (
                  <div className="trip-tailor-success" role="alert">
                    ✓ Thank you! We've received your enquiry and will be in touch within 24 hours.
                  </div>
                )}
                {tripTailorMessage === 'error' && (
                  <div className="trip-tailor-error" role="alert">
                    ❌ Something went wrong. Please email us directly at {contactInfo.emailPrimary}.
                  </div>
                )}
                <button
                  type="submit"
                  className="btn btn-primary submit-button"
                  disabled={tripTailorSubmitting || tripTailorMessage === 'success'}
                >
                  {tripTailorSubmitting ? 'Sending…' : tripTailorMessage === 'success' ? 'Sent ✓' : 'Tailor my trip'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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
              <li><Link to="/admin">🎨 Admin Panel</Link></li>
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
