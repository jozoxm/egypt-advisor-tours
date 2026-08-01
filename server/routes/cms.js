const express = require('express');
const router = express.Router();
const dataStore = require('../data-store');

const RESOURCES = [
    'tours', 'contact', 'blogs', 'settings', 'promotions', 'destinations',
    'gallery', 'slideshow', 'navigation', 'faq', 'tailor-trip', 'homepage',
    'about', 'footer',
];

function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

router.get('/:resource', asyncHandler((req, res) => {
    const key = req.params.resource;
    if (!RESOURCES.includes(key)) {
        return res.status(404).json({ error: 'Unknown resource' });
    }
    const data = dataStore.getAll(key);
    return res.status(200).json(data);
}));

router.post('/:resource', asyncHandler((req, res, next) => {
    const verifyAdmin = req.app.locals.verifyAdmin;
    const verifyCsrf = req.app.locals.verifyCsrf;
    if (!verifyAdmin || !verifyCsrf) return next();

    return new Promise((resolve, reject) => {
        verifyAdmin(req, res, () => {
            verifyCsrf(req, res, () => {
                const key = req.params.resource;
                if (!RESOURCES.includes(key)) {
                    return res.status(404).json({ error: 'Unknown resource' });
                }
                try {
                    dataStore.saveAll(key, req.body);
                    return res.status(200).json({ success: true });
                } catch (err) {
                    return next(err);
                }
            });
        });
    });
}));

router.post('/tailor-trip', asyncHandler((req, res) => {
    const submission = req.body || {};
    const bookings = dataStore.getBookings();
    bookings.push({
        id: Date.now().toString(),
        type: 'tailor-trip',
        ...submission,
        createdAt: new Date().toISOString(),
    });
    dataStore.saveBookings(bookings);
    return res.status(201).json({ success: true });
}));

module.exports = router;
