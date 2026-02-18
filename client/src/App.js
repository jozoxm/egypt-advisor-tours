import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import AdminPanel from './pages/AdminPanel';
import BookingModal from './components/BookingModal';
import { tours, testimonials } from './data/tours-data';
import { contactInfo } from './data/contact-info';
import { blogs } from './data/blogs-data';

// App version for cache busting - increment when Admin button issues occur
const APP_VERSION = '1.0.2';
const MAX_SCROLL_RETRY_ATTEMPTS = 10;
const SCROLL_RETRY_DELAY_MS = 50;

const ToursSection = ({
  filteredTours,
  tourSearch,
  setTourSearch,
  setSelectedTour,
  setBookingTour,
  totalTours,
  heading = 'Signature Experiences',
  subheading = "Carefully curated tours designed to showcase Egypt's most breathtaking destinations"
}) => (
  <section id="tours" className="tours">
    <div className="section-header">
      <h2>{heading}</h2>
      <p>{subheading}</p>
    </div>

    <div className="tours-toolbar">
      <div className="search-input">
        <input
          type="search"
          value={tourSearch}
          onChange={(e) => setTourSearch(e.target.value)}
          placeholder="Search tours by name, duration, or experience (e.g., Nile, pyramids, Luxor)"
          aria-label="Search tours"
        />
        {tourSearch && (
          <button className="clear-search" onClick={() => setTourSearch('')}>
            Clear
          </button>
        )}
      </div>
      <div className="tours-count">
        Showing {filteredTours.length} of {totalTours} tours
      </div>
    </div>
    
    {filteredTours.length === 0 ? (
      <div className="empty-state">
        <p>No tours match that search yet.</p>
        <button className="btn btn-primary" onClick={() => setTourSearch('')}>
          Show all tours
        </button>
      </div>
    ) : (
      <div className="tours-grid">
        {filteredTours.map(tour => (
          <div 
            key={tour.id} 
            className="tour-card"
            onClick={() => setSelectedTour(tour)}
          >
            <div className="tour-image-wrapper">
              <div className="tour-icon">{tour.image}</div>
              <div className="tour-overlay">
                <button className="explore-btn">Explore</button>
              </div>
            </div>
            <div className="tour-content">
              <h3>{tour.name}</h3>
              <div className="tour-rating">
                <span className="stars">{'⭐'.repeat(Math.floor(tour.rating))}</span>
                <span className="rating-text">({tour.reviews} reviews)</span>
              </div>
              <p className="tour-description">{tour.description}</p>
              <div className="tour-details">
                <span className="detail">⏱️ {tour.duration}</span>
                <span className="detail">👥 {tour.groupSize}</span>
              </div>
              <div className="tour-footer">
                <span className="price">{tour.price}</span>
                <button 
                  className="book-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBookingTour(tour);
                  }}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

function App() {
  const [selectedTour, setSelectedTour] = useState(null);
  const [bookingTour, setBookingTour] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tourSearch, setTourSearch] = useState('');
  const [showTripTailor, setShowTripTailor] = useState(false);
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

  // Tours and testimonials are now imported from data files
  // To edit tours, go to: client/src/data/tours-data.js
  // To edit contact info, go to: client/src/data/contact-info.js

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

  const formatBlogDate = (dateString) => {
    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date unavailable';
    }
    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // If admin panel is active, show only the admin panel
  if (showAdmin) {
    return (
      <div className="App">
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
          <div className="nav-container">
            <a href="#home" className="logo-link">
              <img src="/Gold Logo.png?v=5" alt="Egypt Advisor Tours" className="logo-image" />
            </a>
            <button
              className="contact-btn"
              onClick={() => {
                // Ensure main-site mobile menu is closed when leaving admin
                setMenuOpen(false);
                setShowAdmin(false);
              }}
            >
              ← Back to Website
            </button>
          </div>
        </nav>
        <AdminPanel />
      </div>
    );
  }

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
              <Link
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
              </Link>
            </li>
            <li><a href="#blogs" onClick={(e) => { e.preventDefault(); goToSection('blogs'); }}>Blogs</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); goToSection('about'); }}>About</a></li>
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
            <>
              <section id="home" className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                  <span className="hero-tag">🌟 Premium Travel Experiences</span>
                  <h1>Discover the Wonders of Ancient Egypt</h1>
                  <p>Embark on an unforgettable journey through millennia of history, culture, and breathtaking landscapes with expert local guides</p>
                  <div className="hero-buttons">
                    <button className="btn btn-primary" onClick={() => goToSection('tours')}>
                      Explore Tours
                    </button>
                  <button className="btn btn-secondary" onClick={scrollToTripTailor}>
                    Plan My Trip
                  </button>
                  </div>
                </div>
              </section>

              <section className="stats">
                <div className="stat-item">
                  <h3>5000+</h3>
                  <p>Happy Travelers</p>
                </div>
                <div className="stat-item">
                  <h3>25+</h3>
                  <p>Unique Tours</p>
                </div>
                <div className="stat-item">
                  <h3>15+</h3>
                  <p>Years Experience</p>
                </div>
                <div className="stat-item">
                  <h3>4.9★</h3>
                  <p>Average Rating</p>
                </div>
              </section>

              <ToursSection
                filteredTours={filteredTours}
                tourSearch={tourSearch}
                setTourSearch={setTourSearch}
                setSelectedTour={setSelectedTour}
                setBookingTour={setBookingTour}
                totalTours={tours.length}
              />

              <section id="blogs" className="blogs">
                <div className="section-header">
                  <h2>Travel Insights & Blogs</h2>
                  <p>Fresh stories, tips, and cultural guides to help you craft the perfect journey through Egypt</p>
                </div>

                <div className="blogs-grid">
                {blogs.map((blog) => (
                    <article key={blog.id} className="blog-card">
                      <div className="blog-icon">{blog.image}</div>
                      <div className="blog-content">
                        <div className="blog-meta">
                          <span className="blog-category">{blog.category}</span>
                          <span className="blog-date">{formatBlogDate(blog.date)}</span>
                        </div>
                        <h3>{blog.title}</h3>
                        <p className="blog-excerpt">{blog.excerpt}</p>
                        <div className="blog-footer">
                          <span className="blog-author">By {blog.author}</span>
                          <button className="text-button" onClick={scrollToTripTailor}>
                            Tailor a trip like this →
                          </button>
                        </div>
                      </div>
                    </article>
                ))}
                </div>
              </section>

              <section id="about" className="about">
                <div className="about-content">
                  <h2>Why Egypt Advisor?</h2>
                  <p className="about-intro">We're not just a tour company – we're your gateway to authentic Egyptian experiences</p>
                  
                  <div className="features-grid">
                    <div className="feature-card">
                      <div className="feature-icon">🎓</div>
                      <h3>Expert Guides</h3>
                      <p>Certified Egyptologists with decades of combined experience sharing their passion for ancient history</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">🛡️</div>
                      <h3>Safety & Comfort</h3>
                      <p>Your safety is paramount. Climate-controlled vehicles and premium accommodations included</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">💎</div>
                      <h3>Exclusive Access</h3>
                      <p>Private viewings and special permits to explore off-the-beaten-path archaeological sites</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">🌍</div>
                      <h3>Personalized Service</h3>
                      <p>Custom itineraries tailored to your interests, pace, and travel style</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">⭐</div>
                      <h3>Best Value</h3>
                      <p>Transparent pricing with no hidden fees. Premium experiences at competitive rates</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">🤝</div>
                      <h3>24/7 Support</h3>
                      <p>Round-the-clock customer support before, during, and after your journey</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="testimonials">
                <h2>Trusted by Travelers Worldwide</h2>
                <p>See what our satisfied guests have to say about their Egyptian adventures</p>
                
                <div className="testimonials-grid">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="testimonial-card">
                      <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
                      <p className="testimonial-text">"{testimonial.text}"</p>
                      <div className="testimonial-author">
                        <h4>{testimonial.name}</h4>
                        <p>{testimonial.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          }
        />

        <Route
          path="/tours"
          element={
            <>
              <section className="hero tours-hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                  <span className="hero-tag">🧭 Explore Egypt</span>
                  <h1>All Tours & Experiences</h1>
                  <p>Dive into our full collection of curated adventures across Cairo, Luxor, Aswan, the Nile, and beyond.</p>
                  <div className="hero-buttons">
                    <button className="btn btn-primary" onClick={() => goToSection('tours')}>
                      View Tours
                    </button>
                    <button className="btn btn-secondary" onClick={scrollToTripTailor}>
                      Tailor My Trip
                    </button>
                  </div>
                </div>
              </section>

              <ToursSection
                filteredTours={filteredTours}
                tourSearch={tourSearch}
                setTourSearch={setTourSearch}
                setSelectedTour={setSelectedTour}
                setBookingTour={setBookingTour}
                totalTours={tours.length}
                heading="All Egypt Tours"
                subheading="Browse every signature experience and choose the adventure that fits you best."
              />
            </>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {selectedTour && (
        <div className="modal-overlay" onClick={() => setSelectedTour(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedTour(null)}>✕</button>
            <div className="modal-icon">{selectedTour.image}</div>
            <h2>{selectedTour.name}</h2>
            <div className="modal-rating">
              <span className="stars">{'⭐'.repeat(Math.floor(selectedTour.rating))}</span>
              <span>({selectedTour.reviews} reviews)</span>
            </div>
            <p className="modal-description">{selectedTour.description}</p>
            <div className="modal-details">
              <div className="detail-item">
                <span className="detail-label">Duration</span>
                <span className="detail-value">⏱️ {selectedTour.duration}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Group Size</span>
                <span className="detail-value">👥 {selectedTour.groupSize}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Price</span>
                <span className="detail-value price-large">{selectedTour.price}</span>
              </div>
            </div>
            <button className="btn btn-primary modal-button" onClick={() => {
              setSelectedTour(null);
              setBookingTour(selectedTour);
            }}>Book This Tour</button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingTour && (
        <BookingModal 
          tour={bookingTour} 
          onClose={() => setBookingTour(null)} 
        />
      )}

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
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowTripTailor(false);
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
                <button type="submit" className="btn btn-primary submit-button">Tailor my trip</button>
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
              <li><a href="#blogs" onClick={(e) => { e.preventDefault(); goToSection('blogs'); }}>Blogs</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); goToSection('about'); }}>About Us</a></li>
              <li><a href="#admin" onClick={(e) => { e.preventDefault(); setShowAdmin(true); window.scrollTo(0, 0); }}>🎨 Admin Panel</a></li>
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
