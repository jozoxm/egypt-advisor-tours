import React, { useState, useEffect } from 'react';
import { slides as defaultSlides } from '../data/slideshow-data';

const API_URL = process.env.REACT_APP_API_URL || '';

const HeroSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);

  // Load slides from server (falls back to local data if server is unavailable)
  useEffect(() => {
    fetch(`${API_URL}/api/slideshow`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.slides && data.slides.length > 0) {
          setSlides(data.slides);
        }
      })
      .catch(() => {
        // Server not available — keep using local default slides
      });
  }, []);

  useEffect(() => {
    // Auto-rotate slides every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const nextIndex = (currentIndex + 1) % slides.length;

  // Only render the active slide and preload the next one to reduce DOM size.
  // All other slides are unmounted until needed.
  const visibleIndices = new Set([currentIndex, nextIndex]);

  return (
    <div className="hero-slideshow" aria-hidden="true">
      {slides.map((slide, index) => {
        if (!visibleIndices.has(index)) return null;
        const isActive = index === currentIndex;
        const bgStyle = slide.image
          ? { backgroundImage: `url("${slide.image}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : {};
        return (
          <div
            key={slide.id || slide.name}
            className={`hero-slide${isActive ? ' active' : ''}`}
            style={{
              ...bgStyle,
              background: slide.image
                ? `url("${slide.image}") center/cover no-repeat, ${slide.gradient}`
                : slide.gradient
            }}
          />
        );
      })}
    </div>
  );
};

export default HeroSlideshow;
