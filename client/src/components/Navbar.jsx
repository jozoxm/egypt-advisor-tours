import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Assume you have some styles for the navbar

const Navbar = () => {
    return (
        <nav className='navbar'>
            <div className='logo'>
                {/* Replace with your logo image */}
                <img src='path/to/logo.png' alt='Logo' />
            </div>
            <ul className='nav-links'>
                <li><Link to='/tours'>Tours</Link></li>
                <li><Link to='/phrases'>Phrases</Link></li>
                <li><Link to='/food-guide'>Food Guide</Link></li>
                <li><Link to='/tailor-trip'>Tailor Trip</Link></li>
                <li><Link to='/about'>About</Link></li>
                <li><Link to='/contact'>Contact</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;