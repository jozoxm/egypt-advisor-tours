import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    return (
        <div 
            className="hero" 
            style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1600&auto=format&fit=crop)'
            }}
        >
            <div className="hero-content">
                <h1>Discover the Wonders of Egypt</h1>
                <p>Your adventure awaits in the land of pyramids!</p>
                <div className="hero-buttons">
                    <Link to="/tours" className="btn-hero btn-hero-primary">
                        Explore Tours
                    </Link>
                    <Link to="/tailor-trip" className="btn-hero btn-hero-secondary">
                        Tailor Your Trip
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Hero;