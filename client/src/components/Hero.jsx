import React from 'react';
import './Hero.css'; // Assuming you have a CSS file for styling

const Hero = () => {
    return (
        <div className="hero-container">
            <img src="/path-to-your-egyptian-image.jpg" alt="Egypt" className="hero-image" />
            <div className="hero-content">
                <h1 className="hero-title">Discover the Wonders of Egypt</h1>
                <p className="hero-subtitle">Your adventure awaits in the land of pyramids!</p>
                <div className="hero-buttons">
                    <button className="explore-button">Explore Tours</button>
                    <button className="tailor-trip-button">Tailor Your Trip</button>
                </div>
            </div>
        </div>
    );
};

export default Hero;