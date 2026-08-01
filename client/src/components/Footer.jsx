import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>Egypt Advisor Tours</h4>
          <p>Your trusted partner in discovering the wonders of Ancient Egypt</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/tours">Tours</Link></li>
            <li><Link to="/blogs">Blogs</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>📧 info@egyptadvisortours.com</p>
          <p>📞 +20 (123) 456-7890</p>
          <p>📍 Cairo, Egypt</p>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <button type="button">Facebook</button>
            <button type="button">Instagram</button>
            <button type="button">Twitter</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Egypt Advisor Tours. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;