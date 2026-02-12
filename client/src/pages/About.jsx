import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About Egypt Advisor Tours</h1>
        <p>Your trusted companion for authentic Egyptian experiences</p>
      </div>

      <div className="mission-section">
        <h2>Our Mission</h2>
        <p>
          To provide travelers with authentic, memorable, and enriching experiences in Egypt 
          while supporting local communities and preserving ancient heritage for future generations.
        </p>
      </div>

      <section className="about-section">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-box">
            <h3>👨‍🏫 Local Expertise</h3>
            <p>Our team consists of native Egyptians who deeply understand the culture and history</p>
          </div>
          <div className="feature-box">
            <h3>✨ Personalized Service</h3>
            <p>We customize every tour to match your interests and travel style</p>
          </div>
          <div className="feature-box">
            <h3>🛡️ Safety First</h3>
            <p>Your safety and comfort are our top priorities on every trip</p>
          </div>
          <div className="feature-box">
            <h3>💰 Competitive Pricing</h3>
            <p>We offer excellent value without compromising on quality</p>
          </div>
          <div className="feature-box">
            <h3>📞 24/7 Support</h3>
            <p>Our team is always available to assist you during your travels</p>
          </div>
          <div className="feature-box">
            <h3>🌱 Sustainable Tourism</h3>
            <p>We practice responsible tourism that benefits local communities</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Our Values</h2>
        <div className="values-grid">
          <div className="value-box">
            <h3>🌟 Excellence</h3>
            <p>We strive for excellence in every aspect of our service</p>
          </div>
          <div className="value-box">
            <h3>🤝 Integrity</h3>
            <p>We conduct our business with honesty and transparency</p>
          </div>
          <div className="value-box">
            <h3>❤️ Passion</h3>
            <p>We are passionate about Egypt and sharing it with travelers</p>
          </div>
          <div className="value-box">
            <h3>🌍 Responsibility</h3>
            <p>We care for the environment and support local communities</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;