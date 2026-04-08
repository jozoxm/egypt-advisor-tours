import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo-link">
          <img src="/Gold Logo.png?v=5" alt="Egypt Advisor Tours" className="logo-image" />
        </Link>
        <ul className="nav-menu">
          <li><NavLink to="/" end className={() => ''}>Home</NavLink></li>
          <li><NavLink to="/tours">Tours</NavLink></li>
          <li><NavLink to="/blogs">Blogs</NavLink></li>
          <li><NavLink to="/about">About</NavLink></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;