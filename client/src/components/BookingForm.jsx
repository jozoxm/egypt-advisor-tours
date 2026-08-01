import React, { useState } from 'react';

const BookingForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        tour: '',
        date: '',
        travelers: '',
        specialRequests: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Handle form submission
        console.log(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="phone">Phone:</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="tour">Tour Selection:</label>
                <select id="tour" name="tour" value={formData.tour} onChange={handleChange} required>
                    <option value="">Select a tour</option>
                    <option value="Tour 1">Tour 1</option>
                    <option value="Tour 2">Tour 2</option>
                    <option value="Tour 3">Tour 3</option>
                    <option value="Tour 4">Tour 4</option>
                </select>
            </div>
            <div>
                <label htmlFor="date">Date:</label>
                <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="travelers">Number of Travelers:</label>
                <input type="number" id="travelers" name="travelers" value={formData.travelers} onChange={handleChange} required />
            </div>
            <div>
                <label htmlFor="specialRequests">Special Requests:</label>
                <textarea id="specialRequests" name="specialRequests" value={formData.specialRequests} onChange={handleChange}></textarea>
            </div>
            <button type="submit">Book Now</button>
        </form>
    );
};

export default BookingForm;