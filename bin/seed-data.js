#!/usr/bin/env node
/**
 * Seed default content into the data directory.
 *
 * Usage:
 *   node bin/seed-data.js
 *
 * Environment:
 *   HOSTINGER_DATA_PATH - data directory (default: server/data/)
 *   SEED_SLIDESHOW_ONLY - set to "1" to only seed slideshow
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = (() => {
    const envPath = process.env.HOSTINGER_DATA_PATH || process.env.DATA_PATH;
    if (envPath && typeof envPath === 'string' && envPath.trim()) {
        return path.resolve(envPath.trim());
    }
    return path.join(__dirname, '..', 'server', 'data');
})();

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function writeJson(filename, data) {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[seed] Wrote ${filename}`);
}

const defaultSlideshow = {
    slides: [
        { id: 1, name: "Pyramids of Giza", image: "/Assets/362.JPG", gradient: "linear-gradient(135deg, #8B6914 0%, #C9A961 50%, #D4AF37 100%)" },
        { id: 2, name: "The Great Sphinx", image: "/Assets/376.JPG", gradient: "linear-gradient(135deg, #6B4F1A 0%, #9B7540 50%, #C9A040 100%)" },
        { id: 3, name: "Nile River", image: "/Assets/415.JPG", gradient: "linear-gradient(135deg, #0d3b6e 0%, #1a6fa8 50%, #2196c8 100%)" },
        { id: 4, name: "Luxor Temple", image: "/Assets/459.JPG", gradient: "linear-gradient(135deg, #8B6914 0%, #B8964A 50%, #D4AF37 100%)" },
        { id: 5, name: "Karnak Temple", image: "/Assets/488.JPG", gradient: "linear-gradient(135deg, #A88B2D 0%, #C9B037 50%, #E6D69C 100%)" },
        { id: 6, name: "Valley of the Kings", image: "/Assets/480.JPG", gradient: "linear-gradient(135deg, #5c3a1e 0%, #8b5e3c 50%, #c4904e 100%)" },
        { id: 7, name: "Abu Simbel", image: "/Assets/610.JPG", gradient: "linear-gradient(135deg, #7a3a00 0%, #c96a10 50%, #e88a30 100%)" },
        { id: 8, name: "Cairo City", image: "/Assets/624.JPG", gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }
    ]
};

const defaultNavigation = {
    nav: [
        { id: "home", label: "Home", href: "/" },
        { id: "tours", label: "Tours", href: "/tours" },
        { id: "about", label: "About", href: "/about" },
        { id: "contact", label: "Contact", href: "/contact" }
    ]
};

const defaultTours = {
    tours: [],
    testimonials: []
};

const defaultHomepage = {
    hero: {
        title: "Discover Egypt",
        subtitle: "Unforgettable journeys through ancient wonders and modern adventures"
    }
};

function seedSlideshow() {
    const filePath = path.join(DATA_DIR, 'slideshow.json');
    let existing = { slides: [] };
    if (fs.existsSync(filePath)) {
        try {
            existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (err) {
            console.warn('[seed] Could not parse existing slideshow.json, overwriting');
        }
    }
    const existingImages = new Set((existing.slides || []).map(s => s.image).filter(Boolean));
    const merged = (existing.slides || []).filter(s => s.image);
    for (const slide of defaultSlideshow.slides) {
        if (!existingImages.has(slide.image)) {
            merged.push(slide);
        }
    }
    writeJson('slideshow.json', { slides: merged });
}

function seedNavigation() {
    const filePath = path.join(DATA_DIR, 'navigation.json');
    let existing = {};
    if (fs.existsSync(filePath)) {
        try {
            existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (err) {
            console.warn('[seed] Could not parse existing navigation.json, overwriting');
        }
    }
    if (!existing.nav || existing.nav.length === 0) {
        writeJson('navigation.json', defaultNavigation);
    } else {
        console.log('[seed] navigation.json already has data, skipping');
    }
}

function seedEmptyFiles() {
    const seeds = {
        'tours.json': defaultTours,
        'homepage.json': defaultHomepage,
        'about.json': { title: 'About Egypt Advisor Tours', content: '' },
        'contact.json': { email: 'info@egyptadvisortours.com', phone: '', address: '' },
        'settings.json': { siteName: 'Egypt Advisor Tours', currency: 'USD' },
        'footer.json': { copyright: '© 2024 Egypt Advisor Tours' },
        'faq.json': { faqs: [] },
        'tailor-trip.json': { title: 'Tailor Your Trip', description: '' },
        'gallery.json': { gallery: [] },
        'blogs.json': { blogs: [] },
        'promotions.json': { promotions: [] },
        'destinations.json': { destinations: [] },
        'bookings.json': { bookings: [] },
    };

    for (const [filename, defaultData] of Object.entries(seeds)) {
        const filePath = path.join(DATA_DIR, filename);
        if (!fs.existsSync(filePath)) {
            writeJson(filename, defaultData);
        } else {
            try {
                const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (Object.keys(existing).length === 0 || (existing.tours && existing.tours.length === 0 && filename === 'tours.json')) {
                    console.log(`[seed] ${filename} exists but is empty, keeping existing (admin can populate via panel)`);
                } else {
                    console.log(`[seed] ${filename} exists with data, skipping`);
                }
            } catch (err) {
                writeJson(filename, defaultData);
            }
        }
    }
}

function main() {
    console.log(`[seed] DATA_DIR=${DATA_DIR}`);
    ensureDataDir();

    const slideshowOnly = process.env.SEED_SLIDESHOW_ONLY === '1';

    seedSlideshow();
    if (!slideshowOnly) {
        seedNavigation();
        seedEmptyFiles();
    }

    console.log('[seed] Done. Verify with: curl -s https://egyptadvisortours.com/api/slideshow');
}

main();
