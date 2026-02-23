import React from 'react';

const About = () => (
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
);

export default About;