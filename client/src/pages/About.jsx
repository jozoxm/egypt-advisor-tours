import React from 'react';

const About = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>About Egypt Advisor Tours</h1>
      <p style={{ fontSize: '18px' }}>Your trusted companion for authentic Egyptian experiences</p>

      <section style={{ marginTop: '40px' }}>
        <h2>Our Mission</h2>
        <p>
          To provide travelers with authentic, memorable, and enriching experiences in Egypt 
          while supporting local communities and preserving ancient heritage for future generations.
        </p>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>Why Choose Us?</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px' }}>
            <h3>Local Expertise</h3>
            <p>Our team consists of native Egyptians who deeply understand the culture and history</p>
          </div>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px' }}>
            <h3>Personalized Service</h3>
            <p>We customize every tour to match your interests and travel style</p>
          </div>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px' }}>
            <h3>Safety First</h3>
            <p>Your safety and comfort are our top priorities on every trip</p>
          </div>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px' }}>
            <h3>Competitive Pricing</h3>
            <p>We offer excellent value without compromising on quality</p>
          </div>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px' }}>
            <h3>24/7 Support</h3>
            <p>Our team is always available to assist you during your travels</p>
          </div>
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '5px' }}>
            <h3>Sustainable Tourism</h3>
            <p>We practice responsible tourism that benefits local communities</p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>Our Values</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3>🌟 Excellence</h3>
            <p>We strive for excellence in every aspect of our service</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3>🤝 Integrity</h3>
            <p>We conduct our business with honesty and transparency</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3>❤️ Passion</h3>
            <p>We are passionate about Egypt and sharing it with travelers</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3>🌍 Responsibility</h3>
            <p>We care for the environment and support local communities</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;