import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <div className="hero-container">
            <div className="hero-content">
                <h1 className="hero-title">Discover the Wonders of Egypt</h1>
                <p className="hero-subtitle">Your adventure awaits in the land of pyramids!</p>
                <div className="hero-buttons">
                    <button className="explore-button" onClick={() => navigate('/tours')}>
                        Explore Tours
                    </button>
                    <button className="tailor-trip-button" onClick={() => navigate('/tailor-trip')}>
                        Tailor Your Trip
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;