import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer>
      <div className="footer-content">
        <div className="footer-section">
          <h3>🏛️ Egypt Advisor Tours</h3>
          <p>
            Your trusted partner for unforgettable Egyptian adventures. 
            We specialize in creating personalized tours that bring ancient 
            history to life.
          </p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/tours">Tours</Link></li>
            <li><Link to="/tailor-trip">Tailor Your Trip</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Explore Egypt</h3>
          <ul>
            <li><Link to="/egyptian-phrases">Egyptian Phrases</Link></li>
            <li><Link to="/egyptian-food">Egyptian Food Guide</Link></li>
            <li><Link to="/tours">Featured Tours</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact Us</h3>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <span>info@egyptadvisortours.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📱</span>
              <span>+20 123 456 7890</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span>Cairo, Egypt</span>
            </div>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="social-media">
            <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              FB
            </a>
            <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              X
            </a>
            <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              IG
            </a>
            <a href="https://youtube.com" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              YT
            </a>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Newsletter</h3>
          <p>Subscribe to get travel tips and special offers!</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              placeholder="Your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              aria-label="Email for newsletter"
            />
            <button type="submit">
              {subscribed ? '✓ Subscribed!' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p className="copyright">
          &copy; {new Date().getFullYear()} Egypt Advisor Tours. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;