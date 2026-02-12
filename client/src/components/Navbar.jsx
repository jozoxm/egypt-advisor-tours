import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to='/' className="navbar-logo" onClick={closeMenu}>
          🏛️ Egypt Advisor Tours
        </Link>

        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to='/' onClick={closeMenu}>Home</Link></li>
          <li><Link to='/tours' onClick={closeMenu}>Tours</Link></li>
          <li><Link to='/egyptian-phrases' onClick={closeMenu}>Phrases</Link></li>
          <li><Link to='/egyptian-food' onClick={closeMenu}>Food</Link></li>
          <li><Link to='/tailor-trip' className="highlight" onClick={closeMenu}>✨ Tailor Trip</Link></li>
          <li><Link to='/about' onClick={closeMenu}>About</Link></li>
          <li><Link to='/contact' onClick={closeMenu}>Contact</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;