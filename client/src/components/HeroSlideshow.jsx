import React, { useState, useEffect } from 'react';

const HeroSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Array of Egyptian landmark images (using placeholder URLs)
  const images = [
    'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1920&h=1080&fit=crop', // Pyramids of Giza
    'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1920&h=1080&fit=crop', // Sphinx
    'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1920&h=1080&fit=crop', // Nile River
    'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1920&h=1080&fit=crop', // Luxor Temple
    'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=1920&h=1080&fit=crop', // Karnak Temple
    'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1920&h=1080&fit=crop', // Valley of the Kings
    'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1920&h=1080&fit=crop', // Abu Simbel
    'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1920&h=1080&fit=crop'  // Cairo Museum
  ];

  useEffect(() => {
    // Auto-rotate slides every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="hero-slideshow">
      {images.map((image, index) => (
        <div
          key={index}
          className={`hero-slide ${index === currentIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}
    </div>
  );
};

export default HeroSlideshow;
