import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to='/' className="navbar-logo">
          🏛️ Egypt Advisor Tours
        </Link>

        <button className="menu-toggle" onClick={toggleMenu}>
          {isMenuOpen ? '✕' : '☰'}
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to='/' onClick={() => setIsMenuOpen(false)}>Home</Link></li>
          <li><Link to='/tours' onClick={() => setIsMenuOpen(false)}>Tours</Link></li>
          <li><Link to='/blog' onClick={() => setIsMenuOpen(false)}>Blog</Link></li>
          <li><Link to='/egyptian-phrases' onClick={() => setIsMenuOpen(false)}>Phrases</Link></li>
          <li><Link to='/egyptian-food' onClick={() => setIsMenuOpen(false)}>Food</Link></li>
          <li><Link to='/tailor-trip' className="highlight" onClick={() => setIsMenuOpen(false)}>✨ Tailor Trip</Link></li>
          <li><Link to='/about' onClick={() => setIsMenuOpen(false)}>About</Link></li>
          <li><Link to='/contact' onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;