import React, { useState, useEffect } from 'react';

const HeroSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Array of Egyptian landmark placeholders with gradient backgrounds
  // These can be replaced with actual image URLs: backgroundImage: 'url(actual-image.jpg)'
  const slides = [
    { name: 'Pyramids of Giza', gradient: 'linear-gradient(135deg, #8B6914 0%, #C9A961 50%, #D4AF37 100%)' },
    { name: 'The Great Sphinx', gradient: 'linear-gradient(135deg, #9B7D1F 0%, #C9B037 50%, #E6C84E 100%)' },
    { name: 'Nile River', gradient: 'linear-gradient(135deg, #7D6608 0%, #A88B2D 50%, #C9A961 100%)' },
    { name: 'Luxor Temple', gradient: 'linear-gradient(135deg, #8A7210 0%, #B8964A 50%, #D4AF37 100%)' },
    { name: 'Karnak Temple', gradient: 'linear-gradient(135deg, #937A18 0%, #C9A961 50%, #E6D69C 100%)' },
    { name: 'Valley of the Kings', gradient: 'linear-gradient(135deg, #A88B2D 0%, #C9B037 50%, #F0E68C 100%)' },
    { name: 'Abu Simbel', gradient: 'linear-gradient(135deg, #8B7D2D 0%, #B8964A 50%, #D4AF37 100%)' },
    { name: 'Cairo Museum', gradient: 'linear-gradient(135deg, #9B8530 0%, #C9B037 50%, #E6C84E 100%)' }
  ];

  useEffect(() => {
    // Auto-rotate slides every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="hero-slideshow">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`hero-slide ${index === currentIndex ? 'active' : ''}`}
          style={{ 
            background: slide.gradient,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          aria-label={slide.name}
        />
      ))}
    </div>
  );
};

export default HeroSlideshow;
