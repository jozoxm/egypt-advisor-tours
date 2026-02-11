import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setMessage('Thank you for subscribing!');
      setEmail('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section company-info">
          <h3>Egypt Advisor Tours</h3>
          <p>Your trusted partner in exploring the magnificent wonders of Egypt. We create unforgettable experiences that bring ancient history to life.</p>
        </div>
        
        <div className="footer-section quick-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/tours">Tours</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/egyptian-phrases">Egyptian Phrases</Link></li>
            <li><Link to="/egyptian-food">Egyptian Food</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        
        <div className="footer-section contact-details">
          <h3>Contact Us</h3>
          <p><strong>Email:</strong> info@egyptadvisortours.com</p>
          <p><strong>Phone:</strong> +20 123 456 7890</p>
          <p><strong>Address:</strong> Cairo, Egypt</p>
        </div>
        
        <div className="footer-section newsletter-signup">
          <h3>Subscribe to Our Newsletter</h3>
          <p>Get the latest tours and travel tips!</p>
          <form onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <button type="submit">Subscribe</button>
          </form>
          {message && <p className="success-message">{message}</p>}
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="social-media">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        </div>
        <div className="copyright">
          <p>&copy; 2026 Egypt Advisor Tours. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;