const express = require('express');
const router = express.Router();
const dataStore = require('../data-store');

const REQUIRED_CUSTOMER_FIELDS = ['tourId', 'customerName', 'customerEmail'];

function maybeVerifyAdmin(req, res, next) {
    const verifyAdmin = req.app && req.app.locals && req.app.locals.verifyAdmin;
    if (!verifyAdmin) return next();
    return verifyAdmin(req, res, next);
}

router.get('/', maybeVerifyAdmin, (req, res) => {
    res.status(200).json(dataStore.getBookings());
});

router.post('/', maybeVerifyAdmin, (req, res) => {
    const booking = req.body || {};
    if (!booking.id) {
        booking.id = Date.now().toString();
    }
    const bookings = dataStore.getBookings();
    bookings.push(booking);
    dataStore.saveBookings(bookings);
    res.status(201).json({ message: 'Booking created', booking });
});

router.delete('/:id', maybeVerifyAdmin, (req, res) => {
    const bookingId = req.params.id;
    const bookings = dataStore.getBookings().filter(b => b.id !== bookingId);
    dataStore.saveBookings(bookings);
    res.status(204).send();
});

router.post('/customer', (req, res) => {
    const booking = req.body || {};
    const missing = REQUIRED_CUSTOMER_FIELDS.filter((field) => !booking[field]);
    if (missing.length > 0) {
        return res.status(400).json({ error: 'Missing required fields', missing });
    }

    const record = {
        id: Date.now().toString(),
        ...booking,
        createdAt: new Date().toISOString(),
    };
    const bookings = dataStore.getBookings();
    bookings.push(record);
    dataStore.saveBookings(bookings);

    res.status(201).json({ success: true, bookingId: record.id });
});

module.exports = router;
