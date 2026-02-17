import React, { useState, useEffect } from 'react';
import './App.css';
import AdminPanel from './pages/AdminPanel';
import { tours, testimonials } from './data/tours-data';
import { contactInfo } from './data/contact-info';

// App version for cache busting - increment when Admin button issues occur
const APP_VERSION = '1.0.2';

function App() {
  const [selectedTour, setSelectedTour] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

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

  // Tours and testimonials are now imported from data files
  // To edit tours, go to: client/src/data/tours-data.js
  // To edit contact info, go to: client/src/data/contact-info.js

  // If admin panel is active, show only the admin panel
  if (showAdmin) {
    return (
      <div className="App">
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
          <div className="nav-container">
            <a href="#home" className="logo-link">
              <img src="/Gold Logo.png?v=5" alt="Egypt Advisor Tours" className="logo-image" />
            </a>
            <button className="contact-btn" onClick={() => setShowAdmin(false)}>
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
          <a href="#home" className="logo-link">
            <img src="/Gold Logo.png?v=5" alt="Egypt Advisor Tours" className="logo-image" />
          </a>
          <ul className="nav-menu">
            <li><a href="#home">Home</a></li>
            <li><a href="#tours">Tours</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <button className="contact-btn">Inquiry</button>
        </div>
      </nav>

      <section id="home" className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-tag">🌟 Premium Travel Experiences</span>
          <h1>Discover the Wonders of Ancient Egypt</h1>
          <p>Embark on an unforgettable journey through millennia of history, culture, and breathtaking landscapes with expert local guides</p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => document.getElementById('tours').scrollIntoView({ behavior: 'smooth' })}>
              Explore Tours
            </button>
            <button className="btn btn-secondary" onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>
              Contact Us
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

      <section id="tours" className="tours">
        <div className="section-header">
          <h2>Signature Experiences</h2>
          <p>Carefully curated tours designed to showcase Egypt's most breathtaking destinations</p>
        </div>
        
        <div className="tours-grid">
          {tours.map(tour => (
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
                  <button className="book-button">Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
            <button className="btn btn-primary modal-button">Book This Tour</button>
          </div>
        </div>
      )}

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

      <section id="contact" className="contact">
        <div className="contact-content">
          <h2>Ready to Explore?</h2>
          <p>Get in touch with us today and start planning your Egyptian adventure</p>
          
          <form className="contact-form">
            <div className="form-group">
              <input type="text" placeholder="Full Name" required />
            </div>
            <div className="form-group">
              <input type="email" placeholder="Email Address" required />
            </div>
            <div className="form-group">
              <select required>
                <option value="">Select Tour Interest</option>
                <option value="pyramids">Pyramids of Giza</option>
                <option value="luxor">Luxor Temple</option>
                <option value="valley">Valley of the Kings</option>
                <option value="nile">Nile River Cruise</option>
                <option value="museum">Cairo Museum</option>
                <option value="abu">Abu Simbel Temples</option>
              </select>
            </div>
            <div className="form-group">
              <textarea placeholder="Tell us about your travel dates and preferences" rows="4" required></textarea>
            </div>
            <button type="submit" className="btn btn-primary submit-button">Send Inquiry</button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>{contactInfo.companyName}</h4>
            <p>{contactInfo.companyTagline}</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#tours">Tours</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
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