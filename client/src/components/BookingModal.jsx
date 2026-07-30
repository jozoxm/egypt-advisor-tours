import React, { useState } from 'react';
import { contactInfo } from '../data/contact-info';
import './BookingModal.css';

const API_URL = process.env.REACT_APP_API_URL || '';

async function persistBookingToServer(bookingData) {
  try {
    await fetch(`${API_URL}/api/bookings/customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
  } catch {
    // Server persistence is best-effort
  }
}

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
  const [priceCategory, setPriceCategory] = useState('individual');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const getSelectedPrice = () => {
    if (tour.prices) return tour.prices[priceCategory] || tour.prices.individual || '';
    return tour.price || '';
  };

  const selectedPrice = getSelectedPrice();
  const priceNum = parseInt(selectedPrice.replace(/[^0-9]/g, '') || '0', 10);

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

    if (Number.isNaN(priceNum)) {
      setSubmitMessage('Error calculating price. Please contact us directly to complete your booking.');
      setSubmitting(false);
      return;
    }
    const totalPrice = `$${priceNum * formData.numberOfPeople}`;

    const categoryLabel = tour.prices
      ? { individual: 'Individual', group: 'Group', sharing: 'Sharing' }[priceCategory]
      : 'Standard';

    const templateParams = {
      tour_name: tour.name,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      customer_phone: formData.customerPhone,
      number_of_people: formData.numberOfPeople,
      booking_date: formData.bookingDate,
      booking_time: formData.bookingTime,
      special_requests: formData.specialRequests || 'None',
      price_category: categoryLabel,
      total_price: totalPrice,
    };

    persistBookingToServer({
      tourId:          tour.id,
      tourName:        tour.name,
      customerName:    formData.customerName,
      customerEmail:   formData.customerEmail,
      customerPhone:   formData.customerPhone,
      numberOfPeople:  formData.numberOfPeople,
      bookingDate:     formData.bookingDate,
      bookingTime:     formData.bookingTime,
      specialRequests: formData.specialRequests,
      priceCategory:   categoryLabel,
      totalPrice,
    });

    setSubmitMessage(`Booking request received! We will contact you shortly at ${formData.customerEmail}. For immediate assistance, email us at ${contactInfo.emailPrimary} or call ${contactInfo.phone}.`);
    setSubmitting(false);
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>X</button>
        
        <div className="booking-modal-header">
          <span className="tour-icon-large">{tour.image}</span>
          <div>
            <h2>Book: {tour.name}</h2>
            <p className="tour-price-large">{selectedPrice} per person</p>
          </div>
        </div>

        {submitMessage ? (
          <div className={`submit-message success`} role="alert">
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

              {tour.prices && (
                <div className="booking-form-group">
                  <label htmlFor="priceCategory">Price Category *</label>
                  <select
                    id="priceCategory"
                    name="priceCategory"
                    value={priceCategory}
                    onChange={(e) => setPriceCategory(e.target.value)}
                    required
                  >
                    <option value="individual">Individual - {tour.prices.individual} per person</option>
                    <option value="group">Group - {tour.prices.group} per person</option>
                    <option value="sharing">Sharing - {tour.prices.sharing} per person</option>
                  </select>
                </div>
              )}
              
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
                <span>{selectedPrice} x {formData.numberOfPeople}</span>
              </div>
              <div className="summary-row total">
                <span>Total Price:</span>
                <span className="total-price">
                  ${priceNum * formData.numberOfPeople}
                </span>
              </div>
            </div>

            <div className="form-actions-modal">
              <button 
                type="submit" 
                className="btn-submit-booking"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Confirm Booking'}
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
