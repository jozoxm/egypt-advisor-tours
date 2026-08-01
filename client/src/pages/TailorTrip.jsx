import React, { useState } from 'react';

const TailorTrip = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    budget: '',
    duration: '',
    interests: [],
    startDate: '',
    groupSize: '',
    specialRequests: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const interests = [
    'Ancient History',
    'Beach & Water Sports',
    'Food & Culture',
    'Adventure Activities',
    'Luxury Travel',
    'Photography',
    'Shopping',
    'Nightlife'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInterestToggle = (interest) => {
    setFormData({
      ...formData,
      interests: formData.interests.includes(interest)
        ? formData.interests.filter(i => i !== interest)
        : [...formData.interests, interest]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Trip Customization Data:', formData);
    setSubmitted(true);
    
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        budget: '',
        duration: '',
        interests: [],
        startDate: '',
        groupSize: '',
        specialRequests: ''
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Create Your Perfect Egyptian Adventure</h1>
      <p>Let our expert travel consultants design a custom itinerary just for you</p>

      {submitted ? (
        <div style={{ 
          backgroundColor: '#d4edda', 
          padding: '20px', 
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          <h2>✓ Thank You!</h2>
          <p>We've received your trip details. Our team will contact you within 24 hours with personalized recommendations!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2>Personal Information</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your full name"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+1 (555) 000-0000"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h2>Trip Details</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Preferred Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Trip Duration *</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              >
                <option value="">Select duration</option>
                <option value="2-3">2-3 days</option>
                <option value="4-5">4-5 days</option>
                <option value="6-7">6-7 days</option>
                <option value="8-10">8-10 days</option>
                <option value="10+">10+ days</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Group Size *</label>
              <select
                name="groupSize"
                value={formData.groupSize}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              >
                <option value="">Select group size</option>
                <option value="1">Solo Traveler</option>
                <option value="2">Couple (2 people)</option>
                <option value="3-5">Small Group (3-5)</option>
                <option value="6-10">Medium Group (6-10)</option>
                <option value="10+">Large Group (10+)</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Budget Range *</label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
              >
                <option value="">Select budget</option>
                <option value="budget">Budget ($500-1000/person)</option>
                <option value="mid-range">Mid-Range ($1000-3000/person)</option>
                <option value="luxury">Luxury ($3000-7000/person)</option>
                <option value="ultra-luxury">Ultra Luxury ($7000+/person)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h2>What Interests You?</h2>
            <p>Select all that apply</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {interests.map(interest => (
                <label key={interest} style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={() => handleInterestToggle(interest)}
                    style={{ marginRight: '10px' }}
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h2>Special Requests</h2>
            <label style={{ display: 'block', marginBottom: '5px' }}>Tell us about your preferences</label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              placeholder="E.g., vegetarian meals, wheelchair accessibility, specific hotels, etc."
              rows="5"
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
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
              fontSize: '16px',
              width: '100%'
            }}
          >
            Get Your Custom Itinerary
          </button>
        </form>
      )}
    </div>
  );
};

export default TailorTrip;