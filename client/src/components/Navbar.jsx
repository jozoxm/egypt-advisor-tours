import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="logo-link">
          <img src="/Gold Logo.png?v=5" alt="Egypt Advisor Tours" className="logo-image" />
        </NavLink>
        <ul className="nav-menu">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/tours">Tours</NavLink></li>
          <li><NavLink to="/blogs">Blogs</NavLink></li>
          <li><NavLink to="/about">About</NavLink></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;