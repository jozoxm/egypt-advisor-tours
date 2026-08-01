import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import About from './pages/About';
import Faq from './pages/Faq';
import BlogsPage from './pages/BlogsPage';
import TourDetail from './pages/TourDetail';
import HomePage from './pages/HomePage';
import ToursPage from './pages/ToursPage';
import PromotionsPage from './pages/PromotionsPage';
import DestinationsPage from './pages/DestinationsPage';
import TailorTripModal from './components/TailorTripModal';
import ErrorBoundary from './components/ErrorBoundary';
import { useData } from './context/DataContext';
import { getFooter, getNavigation } from './api/cms';
import { fallbackFooter, fallbackNavigation } from './data/cms-fallbacks';

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
  const [navigationContent, setNavigationContent] = useState(fallbackNavigation);
  const [footerContent, setFooterContent] = useState(fallbackFooter);
  const navigate = useNavigate();
  const location = useLocation();
  const scrollTimeoutsRef = useRef([]);

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

useEffect(() => {
  let isMounted = true;

  getNavigation()
    .then((data) => {
      if (!isMounted || !data || typeof data !== 'object') return;
      setNavigationContent((prev) => ({
        ...prev,
        ...data,
        primaryLinks: Array.isArray(data.primaryLinks) && data.primaryLinks.length > 0
          ? data.primaryLinks
          : prev.primaryLinks,
        secondaryLinks: Array.isArray(data.secondaryLinks) ? data.secondaryLinks : prev.secondaryLinks,
        cta: data.cta && typeof data.cta === 'object' ? { ...prev.cta, ...data.cta } : prev.cta,
        mobileMenu: data.mobileMenu && typeof data.mobileMenu === 'object'
          ? { ...prev.mobileMenu, ...data.mobileMenu }
          : prev.mobileMenu,
      }));
    })
    .catch(() => {});

  getFooter()
    .then((data) => {
      if (!isMounted || !data || typeof data !== 'object') return;
      setFooterContent((prev) => ({
        ...prev,
        ...data,
        quickLinks: Array.isArray(data.quickLinks) && data.quickLinks.length > 0 ? data.quickLinks : prev.quickLinks,
        legalLinks: Array.isArray(data.legalLinks) ? data.legalLinks : prev.legalLinks,
      }));
    })
    .catch(() => {});

  return () => {
    isMounted = false;
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

  const navLinks = [
    ...(Array.isArray(navigationContent?.primaryLinks) ? navigationContent.primaryLinks : []),
    ...(Array.isArray(navigationContent?.secondaryLinks) ? navigationContent.secondaryLinks : []),
  ];
  const navCtaLabel = navigationContent?.cta?.label || fallbackNavigation.cta.label;
  const navCtaAction = navigationContent?.cta?.action || fallbackNavigation.cta.action;
  const mobileCtaLabel = navigationContent?.mobileMenu?.ctaLabel || fallbackNavigation.mobileMenu.ctaLabel;

  const handleCmsAction = (action, href) => {
    if (action === 'open-tailor-trip-modal') {
      scrollToTripTailor();
      return;
    }

    if (typeof href === 'string' && href.startsWith('#')) {
      goToSection(href.replace(/^#/, ''));
      return;
    }

    if (typeof href === 'string' && href) {
      if (/^https?:\/\//i.test(href)) {
        window.location.assign(href);
        return;
      }
      navigate(href);
    }
  };

  const handleNavItemClick = (event, link) => {
    const href = typeof link?.href === 'string' ? link.href : '';
    const action = link?.action;

    if (action === 'open-tailor-trip-modal') {
      event.preventDefault();
      scrollToTripTailor();
      return;
    }

    if (href.startsWith('#')) {
      event.preventDefault();
      goToSection(href.replace(/^#/, ''));
      return;
    }

    if (href === '/tours' && location.pathname === '/tours') {
      event.preventDefault();
      scrollToSectionWithRetry('tours');
    }

    setMenuOpen(false);
  };

  return (
    <div className="App">
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="logo-link" onClick={() => { setMenuOpen(false); }}>
            <img src="/Gold Logo.png?v=5" alt={navigationContent.logoText || 'Egypt Advisor Tours'} className="logo-image" />
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
            {(navLinks.length > 0 ? navLinks : fallbackNavigation.primaryLinks).map((link, index) => {
              const href = typeof link?.href === 'string' && link.href ? link.href : '/';
              const label = link?.label || `Link ${index + 1}`;
              const key = `${label}-${href}-${index}`;

              if (link?.action === 'open-tailor-trip-modal') {
                return (
                  <li key={key}>
                    <button className="nav-link-button" type="button" onClick={(e) => handleNavItemClick(e, link)}>
                      {label}
                    </button>
                  </li>
                );
              }

              if (href.startsWith('http')) {
                return (
                  <li key={key}>
                    <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => handleNavItemClick(e, link)}>
                      {label}
                    </a>
                  </li>
                );
              }

              return (
                <li key={key}>
                  <NavLink
                    to={href}
                    end={href === '/'}
                    onClick={(e) => handleNavItemClick(e, link)}
                  >
                    {label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
            <button 
              className="contact-btn"
              onClick={() => handleCmsAction(navCtaAction, navigationContent?.cta?.href)}
            >
              {navCtaLabel}
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

        <Route path="/destinations" element={<ErrorBoundary><DestinationsPage onTailorTrip={scrollToTripTailor} /></ErrorBoundary>} />

        <Route path="/special-offers" element={<ErrorBoundary><PromotionsPage onTailorTrip={scrollToTripTailor} /></ErrorBoundary>} />

        <Route path="/about" element={<ErrorBoundary><About /></ErrorBoundary>} />
        <Route path="/faq" element={<ErrorBoundary><Faq onTailorTrip={scrollToTripTailor} /></ErrorBoundary>} />

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
        {mobileCtaLabel}
      </button>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>{contactInfo.companyName}</h4>
            <p>{footerContent.companyBlurb || contactInfo.companyTagline}</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              {(Array.isArray(footerContent.quickLinks) ? footerContent.quickLinks : fallbackFooter.quickLinks).map((link, index) => {
                const href = typeof link?.href === 'string' && link.href ? link.href : '/';
                const label = link?.label || `Quick Link ${index + 1}`;
                const key = `${label}-${href}-${index}`;

                if (link?.action === 'open-tailor-trip-modal') {
                  return (
                    <li key={key}>
                      <button className="nav-link-button" type="button" onClick={() => scrollToTripTailor()}>
                        {label}
                      </button>
                    </li>
                  );
                }

                if (href.startsWith('http')) {
                  return (
                    <li key={key}>
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {label}
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={key}>
                    <Link
                      to={href}
                      onClick={(e) => {
                        if (href === '/tours' && location.pathname === '/tours') {
                          e.preventDefault();
                          scrollToSectionWithRetry('tours');
                        }
                      }}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          {Array.isArray(footerContent.legalLinks) && footerContent.legalLinks.length > 0 && (
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                {footerContent.legalLinks.map((link, index) => {
                  const href = typeof link?.href === 'string' && link.href ? link.href : '#';
                  const label = link?.label || `Legal Link ${index + 1}`;
                  return (
                    <li key={`${label}-${href}-${index}`}>
                      <a href={href}>{label}</a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
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
          <p>{footerContent.copyright || fallbackFooter.copyright}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
