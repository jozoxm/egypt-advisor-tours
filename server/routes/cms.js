const express = require('express');
const router = express.Router();
const dataStore = require('../data-store');

const RESOURCES = [
    'tours', 'contact', 'blogs', 'settings', 'promotions', 'destinations',
    'gallery', 'slideshow', 'navigation', 'faq', 'tailor-trip', 'homepage',
    'about', 'footer',
];

router.get('/:resource', (req, res) => {
    const key = req.params.resource;
    if (!RESOURCES.includes(key)) {
        return res.status(404).json({ error: 'Unknown resource' });
    }
    const data = dataStore.getAll(key);
    return res.status(200).json(data);
});

router.post('/:resource', (req, res, next) => {
    const verifyAdmin = req.app.locals.verifyAdmin;
    const verifyCsrf = req.app.locals.verifyCsrf;
    if (!verifyAdmin || !verifyCsrf) return next();
    verifyAdmin(req, res, () =>
        verifyCsrf(req, res, () => {
            const key = req.params.resource;
            if (!RESOURCES.includes(key)) {
                return res.status(404).json({ error: 'Unknown resource' });
            }
            dataStore.saveAll(key, req.body);
            res.status(200).json({ success: true });
        })
    );
});

router.post('/tailor-trip', (req, res) => {
    const submission = req.body || {};
    const bookings = dataStore.getBookings();
    bookings.push({
        id: Date.now().toString(),
        type: 'tailor-trip',
        ...submission,
        createdAt: new Date().toISOString(),
    });
    dataStore.saveBookings(bookings);
    res.status(201).json({ success: true });
});

module.exports = router;
