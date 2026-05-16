import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { slides as defaultSlides } from '../data/slideshow-data';
import ToursSection from './ToursSection';
import useSeoMeta from '../hooks/useSeoMeta';
import getSiteUrl from '../utils/siteUrl';
import { getHomepage } from '../api/cms';
import { fallbackHomepage } from '../data/cms-fallbacks';

const API_URL = process.env.REACT_APP_API_URL || '';

const HeroSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState(defaultSlides);

  useEffect(() => {
    fetch(`${API_URL}/api/slideshow`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.slides && data.slides.length > 0) {
          setSlides(data.slides);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const nextIndex = (currentIndex + 1) % slides.length;
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

const formatBlogDate = (dateString) => {
  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) return 'Date unavailable';
  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const HomePage = ({
  siteSettings,
  filteredTours,
  tourSearch,
  setTourSearch,
  totalTours,
  toursLoading,
  blogs,
  testimonials,
  goToSection,
  onTailorTrip,
}) => {
  const siteUrl = getSiteUrl();
  const navigate = useNavigate();
  const [homepageContent, setHomepageContent] = useState(fallbackHomepage);

  useEffect(() => {
    let isMounted = true;

    getHomepage()
      .then((data) => {
        if (!isMounted || !data || typeof data !== 'object') return;
        setHomepageContent((prev) => ({
          ...prev,
          ...data,
          hero: data.hero && typeof data.hero === 'object' ? { ...prev.hero, ...data.hero } : prev.hero,
          highlights: Array.isArray(data.highlights) && data.highlights.length > 0 ? data.highlights : prev.highlights,
        }));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const heroContent = useMemo(() => ({
    ...fallbackHomepage.hero,
    ...(homepageContent.hero || {}),
    badge: homepageContent?.hero?.badge || siteSettings?.hero?.badge || '',
    title: homepageContent?.hero?.title || siteSettings?.hero?.title || fallbackHomepage.hero.title,
    subtitle: homepageContent?.hero?.subtitle || siteSettings?.hero?.subtitle || fallbackHomepage.hero.subtitle,
    primaryButtonText:
      homepageContent?.hero?.primaryButtonText || siteSettings?.hero?.primaryButtonText || fallbackHomepage.hero.primaryButtonText,
    secondaryButtonText:
      homepageContent?.hero?.secondaryButtonText || siteSettings?.hero?.secondaryButtonText || fallbackHomepage.hero.secondaryButtonText,
  }), [homepageContent, siteSettings]);

  const highlights = Array.isArray(homepageContent?.highlights) && homepageContent.highlights.length > 0
    ? homepageContent.highlights
    : (Array.isArray(siteSettings?.stats) && siteSettings.stats.length > 0 ? siteSettings.stats : fallbackHomepage.highlights);

  const handlePrimaryHeroAction = () => {
    const href = heroContent?.primaryButtonHref;

    if (typeof href === 'string' && href.startsWith('#')) {
      goToSection(href.replace(/^#/, ''));
      return;
    }

    if (typeof href === 'string' && href && href !== '/') {
      if (/^https?:\/\//i.test(href)) {
        window.location.assign(href);
        return;
      }
      navigate(href);
      return;
    }

    goToSection('tours');
  };

  const handleSecondaryHeroAction = () => {
    if (heroContent?.secondaryButtonAction === 'open-tailor-trip-modal') {
      onTailorTrip();
      return;
    }
    onTailorTrip();
  };

  useSeoMeta({
    title: null,
    description:
      'Discover Egypt with private guided tours, Nile experiences, and custom itineraries crafted by local experts.',
    path: '/',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'TravelAgency',
      name: 'Egypt Advisor Tours',
      url: `${siteUrl}/`,
      description:
        'Private Egypt tours, Nile cruises, destination guides, and custom itinerary planning.',
    },
  });

  return (
    <>
    <section id="home" className="hero">
      <HeroSlideshow />
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <span className="hero-tag">{heroContent.badge}</span>
        <h1>{heroContent.title}</h1>
        <p>{heroContent.subtitle}</p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={handlePrimaryHeroAction}>
            {heroContent.primaryButtonText}
          </button>
          <button className="btn btn-secondary" onClick={handleSecondaryHeroAction}>
            {heroContent.secondaryButtonText}
          </button>
        </div>
      </div>
    </section>

    <section className="stats">
      {highlights.map((stat, i) => (
        <div key={i} className="stat-item">
          <h3>{stat?.value || ''}</h3>
          <p>{stat?.label || ''}</p>
        </div>
      ))}
    </section>

      <ToursSection
        filteredTours={filteredTours}
        tourSearch={tourSearch}
        setTourSearch={setTourSearch}
        totalTours={totalTours}
        toursLoading={toursLoading}
        heading={homepageContent?.featuredSectionTitle || fallbackHomepage.featuredSectionTitle}
      />

    <section id="blogs" className="blogs">
      <div className="section-header">
        <h2>Travel Insights &amp; Blogs</h2>
        <p>Fresh stories, tips, and cultural guides to help you craft the perfect journey through Egypt</p>
      </div>
      <div className="blogs-grid">
        {blogs.map((blog) => (
          <article key={blog.id} className="blog-card">
            <div className="blog-icon">{blog.image}</div>
            <div className="blog-content">
              <div className="blog-meta">
                <span className="blog-category">{blog.category}</span>
                <span className="blog-date">{formatBlogDate(blog.date)}</span>
              </div>
              <h3>{blog.title}</h3>
              <p className="blog-excerpt">{blog.excerpt}</p>
              <div className="blog-footer">
                <span className="blog-author">By {blog.author}</span>
                <button className="text-button" onClick={onTailorTrip}>
                  Tailor a trip like this →
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section id="about" className="about">
      <div className="about-content">
        <h2>Why Egypt Advisor?</h2>
        <p className="about-intro">We're not just a tour company – we're your gateway to authentic Egyptian experiences</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎓</div>
            <h3>Expert Guides</h3>
            <p>Certified Egyptologists with decades of combined experience sharing their passion for ancient history</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Safety &amp; Comfort</h3>
            <p>Your safety is paramount. Climate-controlled vehicles and premium accommodations included</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3>Exclusive Access</h3>
            <p>Private viewings and special permits to explore off-the-beaten-path archaeological sites</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Personalized Service</h3>
            <p>Custom itineraries tailored to your interests, pace, and travel style</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Best Value</h3>
            <p>Transparent pricing with no hidden fees. Premium experiences at competitive rates</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>24/7 Support</h3>
            <p>Round-the-clock customer support before, during, and after your journey</p>
          </div>
        </div>
      </div>
    </section>

    <section className="testimonials">
      <h2>Trusted by Travelers Worldwide</h2>
      <p>See what our satisfied guests have to say about their Egyptian adventures</p>
      <div className="testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonial-card">
            <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">"{testimonial.text}"</p>
            <div className="testimonial-author">
              <h4>{testimonial.name}</h4>
              <p>{testimonial.country}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
    </>
  );
};

export default HomePage;
