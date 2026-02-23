import React, { useState, useEffect } from 'react';

// Egyptian landmark slides with Egypt-themed gradient backgrounds
const SLIDES = [
  { name: 'Pyramids of Giza',     gradient: 'linear-gradient(135deg, #8B6914 0%, #C9A961 50%, #D4AF37 100%)' },
  { name: 'The Great Sphinx',     gradient: 'linear-gradient(135deg, #6B4F1A 0%, #9B7540 50%, #C9A040 100%)' },
  { name: 'Nile River',           gradient: 'linear-gradient(135deg, #0d3b6e 0%, #1a6fa8 50%, #2196c8 100%)' },
  { name: 'Luxor Temple',         gradient: 'linear-gradient(135deg, #8B6914 0%, #B8964A 50%, #D4AF37 100%)' },
  { name: 'Karnak Temple',        gradient: 'linear-gradient(135deg, #A88B2D 0%, #C9B037 50%, #E6D69C 100%)' },
  { name: 'Valley of the Kings',  gradient: 'linear-gradient(135deg, #5c3a1e 0%, #8b5e3c 50%, #c4904e 100%)' },
  { name: 'Abu Simbel',           gradient: 'linear-gradient(135deg, #7a3a00 0%, #c96a10 50%, #e88a30 100%)' },
  { name: 'Cairo City',           gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' },
];

const HeroSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Auto-rotate slides every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-slideshow">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.name}
          className={`hero-slide ${index === currentIndex ? 'active' : ''}`}
          style={{ background: slide.gradient }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

export default HeroSlideshow;
