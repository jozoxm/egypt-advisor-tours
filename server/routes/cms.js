const express = require('express');
const router = express.Router();

const RESOURCES = [
    'tours', 'contact', 'blogs', 'settings', 'promotions', 'destinations',
    'gallery', 'slideshow', 'navigation', 'faq', 'tailor-trip', 'homepage',
    'about', 'footer',
];

const LABELS = {
    navigation: 'navigation',
    faq: 'FAQ',
    'tailor-trip': 'tailor trip',
    homepage: 'homepage',
    about: 'about',
    footer: 'footer',
};

function fallbackFor(key) {
    switch (key) {
        case 'tours':
            return { tours: [], testimonials: [] };
        case 'blogs':
            return { blogs: [] };
        case 'gallery':
            return { gallery: [] };
        case 'slideshow':
            return { slides: [] };
        default:
            return {};
    }
}

router.get('/:resource', (req, res) => {
    const key = req.params.resource;
    if (!RESOURCES.includes(key)) {
        return res.status(404).json({ error: 'Unknown resource' });
    }

    const label = LABELS[key] || key;
    return res.status(200).json(fallbackFor(key));
});

router.post('/tours', (req, res, next) => {
    const verifyAdmin = req.app.locals.verifyAdmin;
    const verifyCsrf = req.app.locals.verifyCsrf;
    if (!verifyAdmin || !verifyCsrf) return next();
    verifyAdmin(req, res, () =>
        verifyCsrf(req, res, () => {
            res.status(200).json({ success: true });
        })
    );
});

module.exports = router;
