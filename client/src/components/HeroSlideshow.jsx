import React, { useState, useEffect } from 'react';

// Egyptian landmark slides with real photo URLs and gradient fallbacks
const SLIDES = [
  {
    name: 'Pyramids of Giza',
    image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d27b35?auto=format&fit=crop&w=1600&q=80',
    gradient: 'linear-gradient(135deg, #8B6914 0%, #C9A961 50%, #D4AF37 100%)'
  },
  {
    name: 'The Great Sphinx',
    image: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=1600&q=80',
    gradient: 'linear-gradient(135deg, #6B4F1A 0%, #9B7540 50%, #C9A040 100%)'
  },
  {
    name: 'Nile River',
    image: 'https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?auto=format&fit=crop&w=1600&q=80',
    gradient: 'linear-gradient(135deg, #0d3b6e 0%, #1a6fa8 50%, #2196c8 100%)'
  },
  {
    name: 'Luxor Temple',
    image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1600&q=80',
    gradient: 'linear-gradient(135deg, #4a2060 0%, #8b4a9e 50%, #c070d0 100%)'
  },
  {
    name: 'Karnak Temple',
    image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1600&q=80',
    gradient: 'linear-gradient(135deg, #1a3a1a 0%, #2d6a2d 50%, #4a9a4a 100%)'
  },
  {
    name: 'Valley of the Kings',
    image: 'https://images.unsplash.com/photo-1588492069485-d05b56b2831d?auto=format&fit=crop&w=1600&q=80',
    gradient: 'linear-gradient(135deg, #5c3a1e 0%, #8b5e3c 50%, #c4904e 100%)'
  },
  {
    name: 'Abu Simbel',
    image: 'https://images.unsplash.com/photo-1590418606746-018840f9cd0f?auto=format&fit=crop&w=1600&q=80',
    gradient: 'linear-gradient(135deg, #7a3a00 0%, #c96a10 50%, #e88a30 100%)'
  },
  {
    name: 'Cairo City',
    image: 'https://images.unsplash.com/photo-1553697388-94e804e2f0f6?auto=format&fit=crop&w=1600&q=80',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
  }
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
          style={{ 
            background: `url("${slide.image}") center/cover no-repeat, ${slide.gradient}`
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

export default HeroSlideshow;
