const express = require('express');
const router = express.Router();

let bookings = [];
let nextId = 1;

const REQUIRED_CUSTOMER_FIELDS = ['tourId', 'customerName', 'customerEmail'];

function maybeVerifyAdmin(req, res, next) {
    const verifyAdmin = req.app && req.app.locals && req.app.locals.verifyAdmin;
    if (!verifyAdmin) return next();
    return verifyAdmin(req, res, next);
}

router.get('/', maybeVerifyAdmin, (req, res) => {
    res.status(200).json(bookings);
});

router.post('/', maybeVerifyAdmin, (req, res) => {
    const booking = req.body || {};
    if (!booking.id) {
        booking.id = nextId++;
    }
    bookings.push(booking);
    res.status(201).json({ message: 'Booking created', booking });
});

router.delete('/:id', maybeVerifyAdmin, (req, res) => {
    const bookingId = req.params.id;
    bookings = bookings.filter(b => b.id !== bookingId);
    res.status(204).send();
});

router.post('/customer', (req, res) => {
    const booking = req.body || {};
    const missing = REQUIRED_CUSTOMER_FIELDS.filter((field) => !booking[field]);
    if (missing.length > 0) {
        return res.status(400).json({ error: 'Missing required fields', missing });
    }

    const record = {
        id: nextId++,
        ...booking,
        createdAt: new Date().toISOString(),
    };
    bookings.push(record);

    res.status(201).json({ success: true, bookingId: record.id });
});

module.exports = router;
