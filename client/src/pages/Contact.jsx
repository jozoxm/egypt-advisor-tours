import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Contact Form Data:', formData);
    setSubmitted(true);
    
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Contact Us</h1>
      <p>We'd love to hear from you. Get in touch with our team!</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        marginTop: '40px'
      }}>
        <div>
          <h2>Get in Touch</h2>
          
          <div style={{ marginBottom: '30px' }}>
            <h3>📍 Address</h3>
            <p>Cairo, Egypt</p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3>📞 Phone</h3>
            <p>+20 123 456 7890</p>
            <p>Available 24/7</p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3>📧 Email</h3>
            <p>info@egyptadvisortours.com</p>
            <p>support@egyptadvisortours.com</p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h3>🕐 Business Hours</h3>
            <p>Monday - Friday: 9 AM - 6 PM (Egypt Time)</p>
            <p>Saturday - Sunday: 10 AM - 4 PM (Egypt Time)</p>
          </div>

          <div>
            <h3>Follow Us</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="#facebook" style={{ marginRight: '15px' }}>Facebook</a>
              <a href="#instagram" style={{ marginRight: '15px' }}>Instagram</a>
              <a href="#twitter" style={{ marginRight: '15px' }}>Twitter</a>
              <a href="#youtube">YouTube</a>
            </div>
          </div>
        </div>

        <div>
          {submitted ? (
            <div style={{
              backgroundColor: '#d4edda',
              padding: '20px',
              borderRadius: '5px',
              textAlign: 'center'
            }}>
              <h2>✓ Thank You!</h2>
              <p>We've received your message. We'll get back to you soon!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '5px'
            }}>
              <h2>Send us a Message</h2>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What is this about?"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Your message here..."
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc'
                  }}
                ></textarea>
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '12px 30px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  width: '100%',
                  fontSize: '16px'
                }}
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;