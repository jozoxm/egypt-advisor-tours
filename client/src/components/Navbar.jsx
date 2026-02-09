import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{
      backgroundColor: '#333',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link to='/' style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'white',
          textDecoration: 'none'
        }}>
          🏛️ Egypt Advisor Tours
        </Link>

        <ul style={{
          display: 'flex',
          listStyle: 'none',
          gap: '20px',
          margin: 0,
          padding: 0
        }}>
          <li><Link to='/' style={{ color: 'white', textDecoration: 'none' }}>Home</Link></li>
          <li><Link to='/tours' style={{ color: 'white', textDecoration: 'none' }}>Tours</Link></li>
          <li><Link to='/egyptian-phrases' style={{ color: 'white', textDecoration: 'none' }}>Phrases</Link></li>
          <li><Link to='/egyptian-food' style={{ color: 'white', textDecoration: 'none' }}>Food</Link></li>
          <li><Link to='/tailor-trip' style={{ color: '#ffeb3b', textDecoration: 'none', fontWeight: 'bold' }}>✨ Tailor Trip</Link></li>
          <li><Link to='/about' style={{ color: 'white', textDecoration: 'none' }}>About</Link></li>
          <li><Link to='/contact' style={{ color: 'white', textDecoration: 'none' }}>Contact</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;