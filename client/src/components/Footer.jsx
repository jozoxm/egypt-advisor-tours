import React from 'react';

const Footer = () => {
  return (
    <footer>
      <div className="company-info">
        <h3>Company Name</h3>
        <p>About the company and its mission statement.</p>
      </div>
      <div className="quick-links">
        <h3>Quick Links</h3>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/tours">Services</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
      <div className="contact-details">
        <h3>Contact Us</h3>
        <p>Email: info@company.com</p>
        <p>Phone: (123) 456-7890</p>
        <p>Address: 1234 Street Name, City, State, Zip</p>
      </div>
      <div className="social-media">
        <h3>Follow Us</h3>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a> |
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a> |
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
      </div>
      <div className="newsletter-signup">
        <h3>Subscribe to Our Newsletter</h3>
        <form>
          <input type="email" placeholder="Enter your email" required />
          <button type="submit">Subscribe</button>
        </form>
      </div>
      <div className="copyright">
        <p>&copy; 2026 Company Name. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;