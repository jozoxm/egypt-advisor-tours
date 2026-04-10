const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Vercel's (and other reverse-proxy's) X-Forwarded-For header so that
// req.ip reflects the real client IP.  This is required for the rate-limiter
// to work correctly behind Vercel's infrastructure.
app.set('trust proxy', 1);

// Enable CORS
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
// Set ADMIN_SECRET in your environment variables to protect admin endpoints.
// Requests must include the header: X-Admin-Secret: <your-secret>
// If ADMIN_SECRET is not set, all requests are allowed (useful for local dev).
const ADMIN_SECRET = process.env.ADMIN_SECRET;

const requireAdminAuth = (req, res, next) => {
    if (!ADMIN_SECRET) {
        // No secret configured — open access (development mode)
        return next();
    }
    const token = req.headers['x-admin-secret'] || '';
    if (!token || token !== ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized: missing or invalid X-Admin-Secret header.' });
    }
    next();
};

// Rate-limit write (POST) endpoints to prevent abuse
const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

// Rate-limit read (GET) endpoints that hit the filesystem
const readLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});

// ============================================
// INPUT VALIDATION HELPERS
// ============================================
const MAX_STRING_LENGTH = 5000;
const MAX_ARRAY_LENGTH = 500;

// Recursively sanitize a value: truncate strings, limit arrays.
function sanitize(value, depth = 0) {
    if (depth > 10) return value; // guard against deeply nested objects
    if (typeof value === 'string') {
        return value.slice(0, MAX_STRING_LENGTH);
    }
    if (Array.isArray(value)) {
        return value.slice(0, MAX_ARRAY_LENGTH).map((v) => sanitize(v, depth + 1));
    }
    if (value && typeof value === 'object') {
        const result = {};
        for (const key of Object.keys(value).slice(0, 100)) {
            result[key] = sanitize(value[key], depth + 1);
        }
        return result;
    }
    return value;
}

function validateArray(body, field) {
    if (!body || !Array.isArray(body[field])) {
        return `Request body must contain a "${field}" array.`;
    }
    return null;
}

function validateObject(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return 'Request body must be a JSON object.';
    }
    return null;
}

// ============================================
// DATA FILE PATHS
// ============================================
// Primary: server/data/*.json — clean JSON, survives restarts on persistent hosts.
// Fallback: client/src/data/*.js — bundled source files, parsed on cold start.
//
// On hosts like Hostinger that wipe the project directory on each deployment, set
// the DATA_PATH environment variable to an absolute path OUTSIDE the project root
// so that admin-saved data survives across deployments.
// Example (Hostinger): DATA_PATH=/home/u123456789/admin_data
const PROJECT_ROOT = path.resolve(__dirname, '..');
const configuredDataPath = process.env.DATA_PATH;

const DEFAULT_DATA_DIR = path.join(__dirname, 'data');

let DATA_DIR;
if (configuredDataPath) {
    if (!path.isAbsolute(configuredDataPath)) {
        console.warn(
            `[DATA_PATH] Warning: "${configuredDataPath}" is not an absolute path. Falling back to default data directory.`
        );
        DATA_DIR = DEFAULT_DATA_DIR;
    } else {
        const resolvedDataPath = path.resolve(configuredDataPath);
        const relativeToProjectRoot = path.relative(PROJECT_ROOT, resolvedDataPath);
        const isInsideProjectRoot =
            relativeToProjectRoot === '' ||
            (!relativeToProjectRoot.startsWith('..') && !path.isAbsolute(relativeToProjectRoot));

        if (isInsideProjectRoot) {
            console.warn(
                `[DATA_PATH] Warning: "${configuredDataPath}" is inside the project root (${PROJECT_ROOT}). Falling back to default data directory.`
            );
            DATA_DIR = DEFAULT_DATA_DIR;
        } else {
            DATA_DIR = resolvedDataPath;
            // Pre-validate that the directory exists (or can be created) and is writable.
            try {
                fs.mkdirSync(DATA_DIR, { recursive: true });
                fs.accessSync(DATA_DIR, fs.constants.W_OK);
            } catch (err) {
                console.warn(
                    `[DATA_PATH] Warning: "${DATA_DIR}" cannot be created or is not writable (${err.message}). Falling back to default data directory.`
                );
                DATA_DIR = DEFAULT_DATA_DIR;
            }
        }
    }
} else {
    DATA_DIR = DEFAULT_DATA_DIR;
}

// Ensure the chosen data directory exists and is writable.
// On Vercel (and other read-only Lambda environments) the default server/data
// directory cannot be created, so we fall back to /tmp which is always writable.
try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.accessSync(DATA_DIR, fs.constants.W_OK);
} catch (err) {
    const fallback = '/tmp/egypt-advisor-data';
    console.warn(
        `[DATA_PATH] "${DATA_DIR}" is not writable (${err.message}). Falling back to ${fallback}.`
    );
    DATA_DIR = fallback;
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.accessSync(DATA_DIR, fs.constants.W_OK);
    } catch (e) {
        console.error(
            `[DATA_PATH] Fatal: fallback data directory "${DATA_DIR}" cannot be created or is not writable: ${e.message}`
        );
        process.exit(1);
    }
}
const JSON_FILES = {
    tours:     path.join(DATA_DIR, 'tours.json'),
    contact:   path.join(DATA_DIR, 'contact.json'),
    blogs:     path.join(DATA_DIR, 'blogs.json'),
    gallery:   path.join(DATA_DIR, 'gallery.json'),
    bookings:  path.join(DATA_DIR, 'bookings.json'),
    slideshow: path.join(DATA_DIR, 'slideshow.json'),
    settings:  path.join(DATA_DIR, 'settings.json'),
};

// Legacy JS source files — used as cold-start fallbacks only.
const JS_FILES = {
    tours:     path.join(__dirname, '../client/src/data/tours-data.js'),
    contact:   path.join(__dirname, '../client/src/data/contact-info.js'),
    blogs:     path.join(__dirname, '../client/src/data/blogs-data.js'),
    gallery:   path.join(__dirname, '../client/src/data/gallery-data.js'),
    bookings:  path.join(__dirname, '../client/src/data/bookings-data.js'),
    slideshow: path.join(__dirname, '../client/src/data/slideshow-data.js'),
    settings:  path.join(__dirname, '../client/src/data/site-settings.js'),
};

// In-memory data store — used as a writable cache so that admin edits survive
// even when the filesystem is read-only (e.g. Vercel serverless).  Changes
// written here are reflected immediately within the function instance's lifetime.
// On persistent servers the store is also seeded from files on first read, and
// file writes keep both in sync.  Note: a new deployment or function cold-start
// resets the store and reloads from the bundled source/JSON files.
const store = {};

// ============================================
// DATA I/O HELPERS
// ============================================

// Try to read from the JSON data file first; fall back to parsing the legacy JS file.
function readData(key, jsRegex) {
    // 1. Try JSON file (fast, no regex)
    if (fs.existsSync(JSON_FILES[key])) {
        try {
            return JSON.parse(fs.readFileSync(JSON_FILES[key], 'utf8'));
        } catch (e) {
            console.warn(`Could not parse JSON file for "${key}":`, e.message);
        }
    }
    // 2. Fall back to legacy JS source file
    if (fs.existsSync(JS_FILES[key])) {
        try {
            const content = fs.readFileSync(JS_FILES[key], 'utf8');
            const match = content.match(jsRegex);
            if (match) return JSON.parse(match[1]);
        } catch (e) {
            console.warn(`Could not parse JS fallback for "${key}":`, e.message);
        }
    }
    return null;
}

// Write data to the JSON file.  Returns true on success, false on failure.
// Never throws — callers always update the in-memory store first so that
// admin edits survive even when the filesystem is read-only (e.g. Vercel).
function writeData(key, data) {
    if (!JSON_FILES[key]) {
        console.error(`[writeData] Unknown data key: "${key}". This is a programmer error.`);
        return false;
    }
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(JSON_FILES[key], JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.warn(`[writeData] Could not persist "${key}" to disk: ${e.message}. Change is in memory only.`);
        return false;
    }
}

// Seed all JSON data files from their JS source equivalents on startup so that
// the server always has up-to-date JSON files from day one — even on a fresh
// Hostinger deployment where server/data/*.json are gitignored and therefore
// absent from the repository checkout.
const SEED_MAP = [
    { key: 'tours',     regex: /export const tours\s*=\s*(\[[\s\S]*?\]);/,      wrapFn: (m, c) => {
        const testimonialsMatch = c.match(/export const testimonials\s*=\s*(\[[\s\S]*?\]);/);
        return { tours: JSON.parse(m[1]), testimonials: testimonialsMatch ? JSON.parse(testimonialsMatch[1]) : [] };
    }},
    { key: 'contact',   regex: /export const contactInfo\s*=\s*({[\s\S]*?});/,  wrapFn: (m) => JSON.parse(m[1]) },
    { key: 'blogs',     regex: /export const blogs\s*=\s*(\[[\s\S]*?\]);/,      wrapFn: (m) => ({ blogs: JSON.parse(m[1]) }) },
    { key: 'gallery',   regex: /export const gallery\s*=\s*(\[[\s\S]*?\]);/,    wrapFn: (m) => ({ gallery: JSON.parse(m[1]) }) },
    { key: 'slideshow', regex: /export const slides\s*=\s*(\[[\s\S]*?\]);/,     wrapFn: (m) => ({ slides: JSON.parse(m[1]) }) },
    { key: 'settings',  regex: /export const siteSettings\s*=\s*({[\s\S]*?});/, wrapFn: (m) => JSON.parse(m[1]) },
    { key: 'bookings',  regex: /export const bookings\s*=\s*(\[[\s\S]*?\]);/,   wrapFn: (m) => ({ bookings: JSON.parse(m[1]) }) },
];

function seedDataFiles() {
    // If the configured DATA_DIR is not writable (e.g. DATA_PATH points to a
    // directory the process cannot create on this host), fall back to the
    // default server/data directory and then /tmp so that seeding — and all
    // subsequent reads/writes — still work correctly.
    const tmpFallback = '/tmp/egypt-advisor-data';
    // Deduplicate while preserving preference order: configured → default → /tmp.
    const candidateDirs = [...new Set([DATA_DIR, DEFAULT_DATA_DIR, tmpFallback])];

    let workingDir = null;
    for (const candidate of candidateDirs) {
        try {
            fs.mkdirSync(candidate, { recursive: true });
            workingDir = candidate;
            break;
        } catch (e) {
            console.warn(`[seedDataFiles] Cannot create "${candidate}": ${e.message}`);
        }
    }

    if (!workingDir) {
        console.warn('[seedDataFiles] No writable data directory found; data seeding skipped.');
        return;
    }

    // If we had to use a fallback, update the module-level DATA_DIR and
    // JSON_FILES so that all subsequent reads and writes in this process
    // (writeData, readData, etc.) transparently use the working location.
    // This intentional mutation is the simplest way to keep the rest of the
    // server code path-agnostic; DATA_DIR is a module-level `let` precisely
    // to allow this late resolution.
    if (workingDir !== DATA_DIR) {
        console.warn(`[seedDataFiles] Configured DATA_PATH "${DATA_DIR}" is not writable; using "${workingDir}" instead.`);
        DATA_DIR = workingDir;
        for (const key of Object.keys(JSON_FILES)) {
            JSON_FILES[key] = path.join(DATA_DIR, path.basename(JSON_FILES[key]));
        }
    }

    for (const { key, regex, wrapFn } of SEED_MAP) {
        if (fs.existsSync(JSON_FILES[key])) continue; // already present — skip
        const jsFile = JS_FILES[key];
        if (!fs.existsSync(jsFile)) continue;
        try {
            const content = fs.readFileSync(jsFile, 'utf8');
            const match = content.match(regex);
            if (!match) continue;
            const data = wrapFn(match, content);
            fs.writeFileSync(JSON_FILES[key], JSON.stringify(data, null, 2), 'utf8');
            console.log(`Seeded ${JSON_FILES[key]} from JS source.`);
        } catch (e) {
            console.warn(`Could not seed "${key}" from JS source:`, e.message);
        }
    }
}

// Run once at startup — no-ops if files already exist.
// NOTE: seedDataFiles() may update DATA_DIR if the configured path is not writable.
seedDataFiles();
console.log(`Data directory: ${DATA_DIR}`);

app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to Egypt Advisor Tours API',
        version: '1.0.0',
        status: 'Server is running'
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// ============================================
// TOURS API ENDPOINTS
// ============================================

app.get('/api/tours', readLimiter, (req, res) => {
    if (store.tours) return res.json(store.tours);
    const data = readData('tours', /export const tours = (\[[\s\S]*?\]);[\s\S]*export const testimonials = (\[[\s\S]*?\]);/);
    if (data) {
        store.tours = data;
        return res.json(store.tours);
    }
    // Try extracting separately
    const jsContent = fs.existsSync(JS_FILES.tours) ? fs.readFileSync(JS_FILES.tours, 'utf8') : '';
    const toursMatch = jsContent.match(/export const tours = (\[[\s\S]*?\]);/);
    const testimonialsMatch = jsContent.match(/export const testimonials = (\[[\s\S]*?\]);/);
    if (toursMatch) {
        store.tours = {
            tours: JSON.parse(toursMatch[1]),
            testimonials: testimonialsMatch ? JSON.parse(testimonialsMatch[1]) : []
        };
        return res.json(store.tours);
    }
    res.status(500).json({ error: 'Failed to read tours data' });
});

app.post('/api/tours', writeLimiter, requireAdminAuth, (req, res) => {
    const err = validateArray(req.body, 'tours');
    if (err) return res.status(400).json({ error: err });
    try {
        const tours = sanitize(req.body.tours);
        const testimonials = sanitize(req.body.testimonials || []);
        store.tours = { tours, testimonials };
        const persisted = writeData('tours', { tours, testimonials });
        res.json({
            success: true,
            persisted,
            message: persisted ? 'Tours saved successfully' : 'Tours saved in memory but failed to persist'
        });
    } catch (error) {
        console.error('Error saving tours:', error);
        res.status(500).json({ error: 'Failed to save tours data' });
    }
});

// ============================================
// CONTACT API ENDPOINTS
// ============================================

app.get('/api/contact', readLimiter, (req, res) => {
    if (store.contact) return res.json(store.contact);
    const data = readData('contact', /export const contactInfo = ({[\s\S]*?});[\s\n]*$/);
    if (data) {
        store.contact = data;
        return res.json(store.contact);
    }
    res.status(500).json({ error: 'Failed to read contact info' });
});

app.post('/api/contact', writeLimiter, requireAdminAuth, (req, res) => {
    const err = validateObject(req.body);
    if (err) return res.status(400).json({ error: err });
    try {
        const contactInfo = sanitize(req.body);
        store.contact = contactInfo;
        const persisted = writeData('contact', contactInfo);
        res.json({
            success: true,
            persisted,
            message: persisted ? 'Contact info saved successfully' : 'Contact info updated in memory, but failed to persist'
        });
    } catch (error) {
        console.error('Error saving contact info:', error);
        res.status(500).json({ error: 'Failed to save contact info' });
    }
});

// ============================================
// BLOGS API ENDPOINTS
// ============================================

app.get('/api/blogs', readLimiter, (req, res) => {
    if (store.blogs) return res.json(store.blogs);
    const data = readData('blogs', /export const blogs = (\[[\s\S]*?\]);/);
    if (data) {
        store.blogs = data.blogs ? data : { blogs: data };
        return res.json(store.blogs);
    }
    res.status(500).json({ error: 'Failed to read blogs data' });
});

app.post('/api/blogs', writeLimiter, requireAdminAuth, (req, res) => {
    const err = validateArray(req.body, 'blogs');
    if (err) return res.status(400).json({ error: err });
    try {
        const blogs = sanitize(req.body.blogs);
        store.blogs = { blogs };
        const persisted = writeData('blogs', { blogs });
        res.json({
            success: true,
            persisted,
            message: persisted
                ? 'Blogs saved successfully'
                : 'Blogs updated in memory, but failed to persist'
        });
    } catch (error) {
        console.error('Error saving blogs:', error);
        res.status(500).json({ error: 'Failed to save blogs data' });
    }
});

// ============================================
// GALLERY API ENDPOINTS
// ============================================

app.get('/api/gallery', readLimiter, (req, res) => {
    if (store.gallery) return res.json(store.gallery);
    const data = readData('gallery', /export const gallery = (\[[\s\S]*?\]);/);
    if (data) {
        store.gallery = data.gallery ? data : { gallery: data };
        return res.json(store.gallery);
    }
    res.status(500).json({ error: 'Failed to read gallery data' });
});

app.post('/api/gallery', writeLimiter, requireAdminAuth, (req, res) => {
    const err = validateArray(req.body, 'gallery');
    if (err) return res.status(400).json({ error: err });
    try {
        const gallery = sanitize(req.body.gallery);
        store.gallery = { gallery };
        const persisted = writeData('gallery', { gallery });
        res.json({
            success: true,
            persisted,
            message: persisted ? 'Gallery saved successfully' : 'Gallery updated in memory, but failed to persist'
        });
    } catch (error) {
        console.error('Error saving gallery:', error);
        res.status(500).json({ error: 'Failed to save gallery data' });
    }
});

// ============================================
// BOOKINGS API ENDPOINTS
// ============================================
// GET /api/bookings requires admin auth — booking records contain customer PII.

app.get('/api/bookings', readLimiter, requireAdminAuth, (req, res) => {
    if (store.bookings) return res.json(store.bookings);
    const data = readData('bookings', /export const bookings = (\[[\s\S]*?\]);/);
    if (data) {
        store.bookings = data.bookings ? data : { bookings: data };
        return res.json(store.bookings);
    }
    res.status(500).json({ error: 'Failed to read bookings data' });
});

app.post('/api/bookings', writeLimiter, requireAdminAuth, (req, res) => {
    const err = validateArray(req.body, 'bookings');
    if (err) return res.status(400).json({ error: err });
    try {
        const bookings = sanitize(req.body.bookings);
        store.bookings = { bookings };
        const persisted = writeData('bookings', { bookings });
        res.json({
            success: true,
            persisted,
            message: persisted ? 'Bookings saved successfully' : 'Bookings updated in memory, but failed to persist'
        });
    } catch (error) {
        console.error('Error saving bookings:', error);
        res.status(500).json({ error: 'Failed to save bookings data' });
    }
});

// ============================================
// SLIDESHOW API ENDPOINTS
// ============================================

app.get('/api/slideshow', readLimiter, (req, res) => {
    if (store.slideshow) return res.json(store.slideshow);
    const data = readData('slideshow', /export const slides = (\[[\s\S]*?\]);?/);
    if (data) {
        store.slideshow = data.slides ? data : { slides: data };
        return res.json(store.slideshow);
    }
    res.status(500).json({ error: 'Failed to read slideshow data' });
});

app.post('/api/slideshow', writeLimiter, requireAdminAuth, (req, res) => {
    const err = validateArray(req.body, 'slides');
    if (err) return res.status(400).json({ error: err });
    try {
        const slides = sanitize(req.body.slides);
        store.slideshow = { slides };
        const persisted = writeData('slideshow', { slides });
        res.json({
            success: true,
            persisted,
            message: persisted ? 'Slideshow saved successfully' : 'Slideshow updated in memory, but failed to persist'
        });
    } catch (error) {
        console.error('Error saving slideshow:', error);
        res.status(500).json({ error: 'Failed to save slideshow data' });
    }
});

// ============================================
// SITE SETTINGS API ENDPOINTS
// ============================================

app.get('/api/settings', readLimiter, (req, res) => {
    if (store.settings) return res.json(store.settings);
    const data = readData('settings', /export const siteSettings = ({[\s\S]*?});[\s\n]*$/);
    if (data) {
        store.settings = data;
        return res.json(store.settings);
    }
    res.status(500).json({ error: 'Failed to read site settings' });
});

app.post('/api/settings', writeLimiter, requireAdminAuth, (req, res) => {
    const err = validateObject(req.body);
    if (err) return res.status(400).json({ error: err });
    try {
        const settings = sanitize(req.body);
        store.settings = settings;
        const persisted = writeData('settings', settings);
        res.json({
            success: true,
            persisted,
            message: persisted ? 'Site settings saved successfully' : 'Site settings updated in memory, but failed to persist'
        });
    } catch (error) {
        console.error('Error saving site settings:', error);
        res.status(500).json({ error: 'Failed to save site settings' });
    }
});

// Return a JSON 404 for any unmatched /api/* routes so they are never
// swallowed by the SPA catch-all below.
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

// Serve the React static build when it exists (i.e. after running npm run build).
// This catch-all is intentionally placed after all API routes so it only
// matches non-API paths.  On Vercel, static files are served by the CDN from
// the outputDirectory — the Lambda bundle does not contain client/build — so
// this block is intentionally skipped there.
const buildPath = path.join(__dirname, '../client/build');
if (!process.env.VERCEL && process.env.NODE_ENV !== 'development' && fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;