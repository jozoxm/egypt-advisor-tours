import React, { useState } from 'react';
import axios from 'axios';
import './BookingForm.css';

const BookingForm = ({ tourId, tourTitle }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        tourId: tourId || '',
        date: '',
        participants: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await axios.post(`${API_URL}/bookings`, formData);
            
            if (response.data.success) {
                setMessage({ type: 'success', text: response.data.message });
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    tourId: tourId || '',
                    date: '',
                    participants: '',
                });
            }
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to submit booking. Please try again.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="booking-form-container">
            <h3>Book This Tour</h3>
            {tourTitle && <p className="tour-title">Tour: {tourTitle}</p>}
            
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        required 
                        placeholder="Enter your full name"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        placeholder="your.email@example.com"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        required 
                        placeholder="+20 123 456 7890"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Preferred Date *</label>
                    <input 
                        type="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        required 
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="participants">Number of Participants *</label>
                    <input 
                        type="number" 
                        name="participants" 
                        value={formData.participants} 
                        onChange={handleChange} 
                        required 
                        min="1"
                        placeholder="e.g., 2"
                    />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Submitting...' : 'Book Now'}
                </button>
            </form>
        </div>
    );
};

export default BookingForm;