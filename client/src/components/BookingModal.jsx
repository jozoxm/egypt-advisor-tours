import React, { useState } from 'react';
import './BookingModal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const BookingModal = ({ tour, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    numberOfPeople: 1,
    bookingDate: '',
    bookingTime: '09:00 AM',
    specialRequests: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Calculate total price
      const basePrice = parseInt(tour.price.replace('$', ''));
      const totalPrice = `$${basePrice * formData.numberOfPeople}`;
      
      // Create booking object
      const booking = {
        id: Date.now(), // Simple ID generation
        tourId: tour.id,
        tourName: tour.name,
        ...formData,
        totalPrice,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Fetch existing bookings
      const response = await fetch(`${API_URL}/api/bookings`);
      const data = await response.json();
      const existingBookings = data.bookings || [];

      // Add new booking
      const updatedBookings = [...existingBookings, booking];

      // Save to server
      const saveResponse = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookings: updatedBookings }),
      });

      if (saveResponse.ok) {
        setSubmitMessage('✓ Booking submitted successfully! We will contact you shortly.');
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setSubmitMessage('❌ Failed to submit booking. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      setSubmitMessage('❌ Server error. Please try again later or contact us directly.');
    }
    
    setSubmitting(false);
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>✕</button>
        
        <div className="booking-modal-header">
          <span className="tour-icon-large">{tour.image}</span>
          <div>
            <h2>Book: {tour.name}</h2>
            <p className="tour-price-large">{tour.price} per person</p>
          </div>
        </div>

        {submitMessage ? (
          <div className={`submit-message ${submitMessage.includes('✓') ? 'success' : 'error'}`}>
            {submitMessage}
          </div>
        ) : (
          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Your Information</h3>
              
              <div className="booking-form-group">
                <label htmlFor="customerName">Full Name *</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="booking-form-group">
                <label htmlFor="customerEmail">Email Address *</label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="booking-form-group">
                <label htmlFor="customerPhone">Phone Number *</label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  required
                  placeholder="+1-555-0123"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Booking Details</h3>
              
              <div className="booking-form-group">
                <label htmlFor="numberOfPeople">Number of People *</label>
                <input
                  type="number"
                  id="numberOfPeople"
                  name="numberOfPeople"
                  value={formData.numberOfPeople}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  required
                />
              </div>

              <div className="booking-form-group">
                <label htmlFor="bookingDate">Preferred Date *</label>
                <input
                  type="date"
                  id="bookingDate"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="booking-form-group">
                <label htmlFor="bookingTime">Preferred Time *</label>
                <select
                  id="bookingTime"
                  name="bookingTime"
                  value={formData.bookingTime}
                  onChange={handleChange}
                  required
                >
                  <option value="08:00 AM">08:00 AM</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                </select>
              </div>

              <div className="booking-form-group">
                <label htmlFor="specialRequests">Special Requests (Optional)</label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Any dietary restrictions, accessibility needs, or special occasions?"
                />
              </div>
            </div>

            <div className="booking-summary">
              <div className="summary-row">
                <span>Tour Price:</span>
                <span>{tour.price} × {formData.numberOfPeople}</span>
              </div>
              <div className="summary-row total">
                <span>Total Price:</span>
                <span className="total-price">
                  ${parseInt(tour.price.replace('$', '')) * formData.numberOfPeople}
                </span>
              </div>
            </div>

            <div className="form-actions-modal">
              <button 
                type="submit" 
                className="btn-submit-booking"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : '✓ Confirm Booking'}
              </button>
              <button 
                type="button" 
                className="btn-cancel-modal"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
