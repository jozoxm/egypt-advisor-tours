import React, { useState, useEffect } from 'react';
import './VideoSlideshow.css';

const VideoSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Discover Ancient Egypt',
      description: 'Experience the magnificent pyramids and temples that have stood for millennia',
      videoUrl: 'https://www.youtube.com/embed/VX4XfSvcU04',
      thumbnail: '🏛️'
    },
    {
      id: 2,
      title: 'Cruise the Nile River',
      description: 'Sail through history on the legendary Nile, Egypt\'s lifeline',
      videoUrl: 'https://www.youtube.com/embed/KfD4BsFVOzI',
      thumbnail: '🚤'
    },
    {
      id: 3,
      title: 'Explore Luxor & Karnak',
      description: 'Marvel at the grandeur of ancient Egyptian architecture',
      videoUrl: 'https://www.youtube.com/embed/A-BMlXQt1aI',
      thumbnail: '🕌'
    }
  ];

  const highlights = [
    {
      icon: '🌟',
      title: 'Expert Egyptologists',
      description: 'Learn from certified guides with deep knowledge of Egyptian history'
    },
    {
      icon: '🛡️',
      title: 'Safe & Comfortable',
      description: 'Premium vehicles and accommodations for your peace of mind'
    },
    {
      icon: '💎',
      title: 'Exclusive Access',
      description: 'VIP entry to monuments with skip-the-line privileges'
    },
    {
      icon: '📸',
      title: 'Unforgettable Memories',
      description: 'Professional photography opportunities at iconic locations'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="video-slideshow-section">
      <div className="slideshow-container">
        <div className="slideshow-header">
          <h2>Experience Egypt Like Never Before</h2>
          <p>Immerse yourself in the wonders of ancient civilization</p>
        </div>

        <div className="video-slideshow">
          <button className="slide-nav prev" onClick={prevSlide} aria-label="Previous slide">
            ‹
          </button>

          <div className="slides-wrapper">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`slide ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="video-container">
                  <iframe
                    src={`${slide.videoUrl}?autoplay=0&mute=1&controls=1&rel=0`}
                    title={slide.title}
                    frameBorder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="slide-content">
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="slide-nav next" onClick={nextSlide} aria-label="Next slide">
            ›
          </button>
        </div>

        <div className="slide-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="highlights-container">
        <h3>Why Travel With Us</h3>
        <div className="highlights-grid">
          {highlights.map((highlight, index) => (
            <div key={index} className="highlight-card">
              <div className="highlight-icon">{highlight.icon}</div>
              <h4>{highlight.title}</h4>
              <p>{highlight.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoSlideshow;
