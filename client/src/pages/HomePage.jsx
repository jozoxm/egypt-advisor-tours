import React from 'react';
import HeroSlideshow from '../components/HeroSlideshow';
import ToursSection from './ToursSection';

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
}) => (
  <>
    <section id="home" className="hero">
      <HeroSlideshow />
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <span className="hero-tag">{siteSettings.hero.badge}</span>
        <h1>{siteSettings.hero.title}</h1>
        <p>{siteSettings.hero.subtitle}</p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={() => goToSection('tours')}>
            {siteSettings.hero.primaryButtonText}
          </button>
          <button className="btn btn-secondary" onClick={onTailorTrip}>
            {siteSettings.hero.secondaryButtonText}
          </button>
        </div>
      </div>
    </section>

    <section className="stats">
      {siteSettings.stats.map((stat, i) => (
        <div key={i} className="stat-item">
          <h3>{stat.value}</h3>
          <p>{stat.label}</p>
        </div>
      ))}
    </section>

    <ToursSection
      filteredTours={filteredTours}
      tourSearch={tourSearch}
      setTourSearch={setTourSearch}
      totalTours={totalTours}
      toursLoading={toursLoading}
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

export default HomePage;
