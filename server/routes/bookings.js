const express = require('express');
const router = express.Router();

// Mock database for bookings
let bookings = [];

// POST endpoint for creating a new booking
router.post('/', (req, res) => {
    const booking = req.body;
    // Assuming booking contains details like tourId, userId, etc.
    bookings.push(booking);
    res.status(201).json({ message: 'Booking created', booking });
});

// GET endpoint for retrieving all bookings
router.get('/', (req, res) => {
    res.status(200).json(bookings);
});

// DELETE endpoint for canceling a booking by ID
router.delete('/:id', (req, res) => {
    const bookingId = req.params.id;
    bookings = bookings.filter(b => b.id !== bookingId);
    res.status(204).send();
});

module.exports = router;