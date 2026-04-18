const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Vercel's (and other reverse-proxy's) X-Forwarded-For header so that
// req.ip reflects the real client IP.  This is required for the rate-limiter
// to work correctly behind Vercel's infrastructure.
app.set('trust proxy', 1);

// ============================================
// PAYLOAD CMS PROXY
// ============================================
// The Payload CMS admin panel (Next.js) runs on its own port (CMS_PORT,
// default 3001).  Requests for /admin, /_next, /api/media, and /media are
// transparently proxied to it so the browser sees everything on the same
// origin.
//
// IMPORTANT: the proxy is mounted at root ('/') with a pathFilter instead of
// using separate app.use('/admin', proxy) calls.  When mounted at a subpath,
// Express strips the matched prefix from req.url before passing it to the
// proxy middleware — so /admin would be forwarded to the CMS as / (triggering
// an infinite redirect loop) and /_next/static/... would lose its /_next
// prefix (causing genuine 404s for JS bundles).  Mounting at root with
// pathFilter preserves the full path end-to-end.
//
// Set CMS_URL in .env to override (e.g. CMS_URL=http://localhost:3001).
// If the CMS service is not running, the proxy returns a 503 with a clear
// error message rather than crashing the main Express server.
//
// Registered BEFORE helmet so that the CMS's own Next.js headers are not
// overwritten by Express's CSP headers.
const CMS_URL = process.env.CMS_URL || 'http://localhost:3001';
// Path prefixes that must be forwarded to the CMS process.  Defined at
// module level so the constant is not reallocated on every request.
const CMS_PROXY_PATHS = ['/admin', '/_next', '/api/media', '/media'];
const cmsProxyOptions = {
    target: CMS_URL,
    changeOrigin: true,
    // Only proxy requests that belong to the CMS; everything else falls
    // through to the next middleware (helmet, static files, API routes, etc.).
    // Note: http-proxy-middleware strips query strings from `pathname` before
    // calling pathFilter, so startsWith checks are safe against ?foo=bar.
    pathFilter: (pathname) =>
        CMS_PROXY_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')),
    on: {
        error: (err, _req, res) => {
            console.error('[CMS Proxy] Error connecting to CMS:', err.message);
            if (res && !res.headersSent) {
                res.status(503).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Admin Panel — Unavailable</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 80px auto; padding: 0 24px; text-align: center; color: #333; }
    h1  { color: #c0392b; margin-bottom: 12px; }
    p   { line-height: 1.6; color: #555; }
    code { background: #f4f4f4; padding: 2px 8px; border-radius: 4px; font-size: .9em; }
    .hint { margin-top: 32px; font-size: .875rem; color: #888; }
  </style>
</head>
<body>
  <h1>Admin Panel Unavailable</h1>
  <p>The CMS service is not running or is still starting up.</p>
  <p>If this is a fresh deployment, please wait about 30 seconds and then
     <a href="/admin">refresh this page</a>.</p>
  <p class="hint">If the problem persists, make sure the CMS process is running:<br>
     <code>npm run start --prefix cms</code></p>
</body>
</html>`);
            }
        },
    },
};
app.use(createProxyMiddleware(cmsProxyOptions));

// ============================================
// SECURITY HEADERS (helmet)
// ============================================
// Applied AFTER the CMS proxy so that Next.js can set its own headers for
// /admin and /_next responses without being overridden.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdn.emailjs.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://api.emailjs.com"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
        },
    },
    // Strict-Transport-Security is sent automatically by helmet
    crossOriginEmbedderPolicy: false, // Allow Unsplash images
}));

// Enable CORS.
// In production, restrict to the configured origin (CORS_ORIGIN env var) or the
// live domain.  In development, allow all origins so the dev server on
// localhost:3000 can call the API on localhost:5000.
const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? 'https://egyptadvisortours.com' : undefined);
const corsOptions = corsOrigin
    ? { origin: corsOrigin, optionsSuccessStatus: 200, credentials: true }
    : { credentials: true }; // allow all origins in development, but still send credentials
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
// CSRF protection strategy: all admin session cookies are set with SameSite=Strict,
// which instructs browsers never to send the cookie on cross-origin requests.
// This is equivalent to CSRF token protection for same-origin browser clients.
// API-only clients (non-browser) authenticate via the same SameSite=Strict cookie
// and are expected to operate from the same origin.
app.use(cookieParser());

// ============================================
// AUTHENTICATION — JWT-BASED ADMIN AUTH
// ============================================
// Set ADMIN_PASSWORD (and optionally ADMIN_USERNAME, default "admin") in your
// environment to protect admin endpoints.  The client POSTs credentials to
// /api/admin/login, which returns a short-lived JWT in an httpOnly cookie.
// If ADMIN_PASSWORD is not set, all admin requests are allowed (local dev).
//
// The JWT is signed with ADMIN_SECRET (re-used as the signing key).
// If only ADMIN_SECRET is set (legacy), that still works as the password check
// so existing deployments continue to function without any env-var changes.

const ADMIN_SECRET   = process.env.ADMIN_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ADMIN_SECRET; // backward compat
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const JWT_SECRET     = ADMIN_SECRET || 'dev-jwt-secret-not-for-production';
const JWT_EXPIRES_IN = '24h';

const ADMIN_COOKIE_NAME = 'adminToken';

// Strict rate-limiter for the login endpoint to slow brute-force attempts.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again later.' }
});

const requireAdminAuth = (req, res, next) => {
    if (!ADMIN_PASSWORD) {
        // No password configured — open access (development mode)
        return next();
    }

    // Prefer the httpOnly JWT cookie (new path).
    const cookieToken = req.cookies && req.cookies[ADMIN_COOKIE_NAME];
    if (cookieToken) {
        try {
            jwt.verify(cookieToken, JWT_SECRET);
            return next();
        } catch {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }
    }

    // Backward-compat: also accept the legacy X-Admin-Secret header so that
    // existing clients (e.g. still using the old REACT_APP_ADMIN_SECRET) keep
    // working during a rolling upgrade.
    const legacyToken = req.headers['x-admin-secret'] || '';
    if (legacyToken && legacyToken === ADMIN_SECRET) {
        return next();
    }

    return res.status(401).json({ error: 'Unauthorized: please log in at /admin.' });
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
    tours:        path.join(DATA_DIR, 'tours.json'),
    contact:      path.join(DATA_DIR, 'contact.json'),
    blogs:        path.join(DATA_DIR, 'blogs.json'),
    gallery:      path.join(DATA_DIR, 'gallery.json'),
    bookings:     path.join(DATA_DIR, 'bookings.json'),
    slideshow:    path.join(DATA_DIR, 'slideshow.json'),
    settings:     path.join(DATA_DIR, 'settings.json'),
    promotions:   path.join(DATA_DIR, 'promotions.json'),
    destinations: path.join(DATA_DIR, 'destinations.json'),
};

// Legacy JS source files — used as cold-start fallbacks only.
const JS_FILES = {
    tours:        path.join(__dirname, '../client/src/data/tours-data.js'),
    contact:      path.join(__dirname, '../client/src/data/contact-info.js'),
    blogs:        path.join(__dirname, '../client/src/data/blogs-data.js'),
    gallery:      path.join(__dirname, '../client/src/data/gallery-data.js'),
    bookings:     path.join(__dirname, '../client/src/data/bookings-data.js'),
    slideshow:    path.join(__dirname, '../client/src/data/slideshow-data.js'),
    settings:     path.join(__dirname, '../client/src/data/site-settings.js'),
    promotions:   path.join(__dirname, '../client/src/data/promotions-data.js'),
    destinations: path.join(__dirname, '../client/src/data/destinations-data.js'),
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

// Write data to the JSON file atomically (write to a temp file in the same
// directory, then rename).  Returns true on success, false on failure.
// Never throws — callers always update the in-memory store first so that
// admin edits survive even when the filesystem is read-only (e.g. Vercel).
function writeData(key, data) {
    if (!JSON_FILES[key]) {
        console.error(`[writeData] Unknown data key: "${key}". This is a programmer error.`);
        return false;
    }
    const dest = JSON_FILES[key];
    const tmp  = dest + '.tmp';
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
        fs.renameSync(tmp, dest);
        return true;
    } catch (e) {
        // Best-effort cleanup of the temp file on failure.
        try { fs.unlinkSync(tmp); } catch (_) {}
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
    { key: 'contact',      regex: /export const contactInfo\s*=\s*({[\s\S]*?});/,     wrapFn: (m) => JSON.parse(m[1]) },
    { key: 'blogs',        regex: /export const blogs\s*=\s*(\[[\s\S]*?\]);/,         wrapFn: (m) => ({ blogs: JSON.parse(m[1]) }) },
    { key: 'gallery',      regex: /export const gallery\s*=\s*(\[[\s\S]*?\]);/,       wrapFn: (m) => ({ gallery: JSON.parse(m[1]) }) },
    { key: 'slideshow',    regex: /export const slides\s*=\s*(\[[\s\S]*?\]);/,        wrapFn: (m) => ({ slides: JSON.parse(m[1]) }) },
    { key: 'settings',     regex: /export const siteSettings\s*=\s*({[\s\S]*?});/,    wrapFn: (m) => JSON.parse(m[1]) },
    { key: 'bookings',     regex: /export const bookings\s*=\s*(\[[\s\S]*?\]);/,      wrapFn: (m) => ({ bookings: JSON.parse(m[1]) }) },
    { key: 'promotions',   regex: /export const promotions\s*=\s*(\[[\s\S]*?\]);/,    wrapFn: (m) => ({ promotions: JSON.parse(m[1]) }) },
    { key: 'destinations', regex: /export const destinations\s*=\s*(\[[\s\S]*?\]);/,  wrapFn: (m) => ({ destinations: JSON.parse(m[1]) }) },
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
        const dest = JSON_FILES[key];
        const tmp  = dest + '.tmp';
        try {
            const content = fs.readFileSync(jsFile, 'utf8');
            const match = content.match(regex);
            if (!match) continue;
            const data = wrapFn(match, content);
            fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
            fs.renameSync(tmp, dest);
            console.log(`Seeded ${dest} from JS source.`);
        } catch (e) {
            // Best-effort cleanup of the temp file on failure.
            try { fs.unlinkSync(tmp); } catch (_) {}
            console.warn(`Could not seed "${key}" from JS source:`, e.message);
        }
    }
}

// Run once at startup — no-ops if files already exist.
// NOTE: seedDataFiles() may update DATA_DIR if the configured path is not writable.
seedDataFiles();
console.log(`Data directory: ${DATA_DIR}`);

// ============================================
// STARTUP: VALIDATE JSON DATA FILES
// ============================================
// Warn at startup if any JSON data file exists but is malformed so that
// the problem is immediately visible in the server logs rather than only
// surfacing as a 500 error when the relevant API endpoint is first hit.
function validateDataFiles() {
    for (const [key, filePath] of Object.entries(JSON_FILES)) {
        if (!fs.existsSync(filePath)) continue;
        try {
            JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.error(
                `[WARN] Data file for "${key}" at "${filePath}" is malformed and will be ignored until fixed: ${e.message}`
            );
        }
    }
}
validateDataFiles();

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
// ADMIN AUTH ENDPOINTS
// ============================================

// POST /api/admin/login
// Body: { username?: string, password: string }
// Sets an httpOnly JWT cookie on success.
// Security note: JWTs are stored in an httpOnly SameSite=Strict cookie.
// The cookie is inaccessible to JavaScript and protected against CSRF via SameSite=Strict.
// CodeQL may flag JWT-in-cookie as "clear-text storage" — this is intentional and
// is the industry-standard stateless session pattern for server-rendered / API setups.
app.post('/api/admin/login', loginLimiter, (req, res) => {
    if (!ADMIN_PASSWORD) {
        // Dev mode — no password configured, issue a token anyway so the
        // admin panel works without any setup.
        const devToken = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.cookie(ADMIN_COOKIE_NAME, devToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
        });
        return res.json({ success: true, message: 'Logged in (dev mode — no password required).' });
    }

    const { username = 'admin', password } = req.body || {};

    if (
        typeof username !== 'string' ||
        typeof password !== 'string' ||
        username.trim() !== ADMIN_USERNAME ||
        password !== ADMIN_PASSWORD
    ) {
        return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const sessionToken = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.cookie(ADMIN_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    res.json({ success: true, message: 'Logged in successfully.' });
});

// GET /api/admin/verify — returns 200 if the session cookie is valid.
// Rate-limited to slow any automated probing of session validity.
app.get('/api/admin/verify', loginLimiter, (req, res) => {
    if (!ADMIN_PASSWORD) {
        return res.json({ authenticated: true, devMode: true });
    }
    const cookieToken = req.cookies && req.cookies[ADMIN_COOKIE_NAME];
    if (!cookieToken) {
        return res.status(401).json({ authenticated: false });
    }
    try {
        jwt.verify(cookieToken, JWT_SECRET);
        return res.json({ authenticated: true });
    } catch {
        return res.status(401).json({ authenticated: false });
    }
});

// POST /api/admin/logout — clears the session cookie.
app.post('/api/admin/logout', (req, res) => {
    res.clearCookie(ADMIN_COOKIE_NAME, { httpOnly: true, sameSite: 'strict' });
    res.json({ success: true, message: 'Logged out.' });
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

// POST /api/bookings/customer — public endpoint that appends a single customer
// booking record.  No admin auth required; the booking details are validated
// and sanitized before being stored alongside admin-managed bookings.
// Rate-limited to 20 requests per 15 minutes per IP to prevent spam.
const customerBookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many booking requests, please try again later.' }
});

app.post('/api/bookings/customer', customerBookingLimiter, (req, res) => {
    const err = validateObject(req.body);
    if (err) return res.status(400).json({ error: err });

    const { tourId, tourName, customerName, customerEmail, customerPhone,
            numberOfPeople, bookingDate, bookingTime, specialRequests,
            priceCategory, totalPrice } = req.body;

    if (!customerName || !customerEmail || !tourId) {
        return res.status(400).json({ error: 'customerName, customerEmail, and tourId are required.' });
    }

    try {
        // Load existing bookings
        if (!store.bookings) {
            const data = readData('bookings', /export const bookings = (\[[\s\S]*?\]);/);
            store.bookings = data
                ? (data.bookings ? data : { bookings: data })
                : { bookings: [] };
        }

        const existing = Array.isArray(store.bookings.bookings) ? store.bookings.bookings : [];

        const newBooking = sanitize({
            id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            source: 'customer',
            submittedAt: new Date().toISOString(),
            tourId,
            tourName:        tourName        || '',
            customerName:    customerName    || '',
            customerEmail:   customerEmail   || '',
            customerPhone:   customerPhone   || '',
            numberOfPeople:  numberOfPeople  || 1,
            bookingDate:     bookingDate     || '',
            bookingTime:     bookingTime     || '',
            specialRequests: specialRequests || '',
            priceCategory:   priceCategory   || 'individual',
            totalPrice:      totalPrice      || '',
            status: 'pending',
        });

        const updatedBookings = [...existing, newBooking];
        store.bookings = { bookings: updatedBookings };
        writeData('bookings', { bookings: updatedBookings });

        res.status(201).json({ success: true, bookingId: newBooking.id, message: 'Booking received successfully.' });
    } catch (error) {
        console.error('Error saving customer booking:', error);
        res.status(500).json({ error: 'Failed to save booking. Please try again.' });
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

// ============================================
// PROMOTIONS API ENDPOINTS
// ============================================

app.get('/api/promotions', readLimiter, (req, res) => {
    if (store.promotions) return res.json(store.promotions);
    const data = readData('promotions', /export const promotions\s*=\s*(\[[\s\S]*?\]);/);
    if (data) {
        store.promotions = data.promotions ? data : { promotions: data };
        return res.json(store.promotions);
    }
    // No data file yet — return an empty list rather than a 500 so the
    // front-end degrades gracefully on a fresh deployment.
    store.promotions = { promotions: [] };
    res.json(store.promotions);
});

app.post('/api/promotions', writeLimiter, requireAdminAuth, (req, res) => {
    const err = validateArray(req.body, 'promotions');
    if (err) return res.status(400).json({ error: err });
    try {
        const promotions = sanitize(req.body.promotions);
        store.promotions = { promotions };
        const persisted = writeData('promotions', { promotions });
        res.json({
            success: true,
            persisted,
            message: persisted ? 'Promotions saved successfully' : 'Promotions updated in memory, but failed to persist'
        });
    } catch (error) {
        console.error('Error saving promotions:', error);
        res.status(500).json({ error: 'Failed to save promotions data' });
    }
});

// ============================================
// DESTINATIONS API ENDPOINTS
// ============================================

app.get('/api/destinations', readLimiter, (req, res) => {
    if (store.destinations) return res.json(store.destinations);
    const data = readData('destinations', /export const destinations\s*=\s*(\[[\s\S]*?\]);/);
    if (data) {
        store.destinations = data.destinations ? data : { destinations: data };
        return res.json(store.destinations);
    }
    store.destinations = { destinations: [] };
    res.json(store.destinations);
});

app.post('/api/destinations', writeLimiter, requireAdminAuth, (req, res) => {
    const err = validateArray(req.body, 'destinations');
    if (err) return res.status(400).json({ error: err });
    try {
        const destinations = sanitize(req.body.destinations);
        store.destinations = { destinations };
        const persisted = writeData('destinations', { destinations });
        res.json({
            success: true,
            persisted,
            message: persisted ? 'Destinations saved successfully' : 'Destinations updated in memory, but failed to persist'
        });
    } catch (error) {
        console.error('Error saving destinations:', error);
        res.status(500).json({ error: 'Failed to save destinations data' });
    }
});

// Return a JSON 404 for any unmatched /api/* routes so they are never
// swallowed by the SPA catch-all below.
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

// Serve the React static build when it exists (i.e. after running npm run build).
// The build script (scripts/build-client.js) sets BUILD_PATH to the project
// root's build/ directory when invoking CRA, so Hostinger can find it here.
// On Vercel, static files are served by the CDN from the outputDirectory
// (client/build) — the Lambda bundle does not contain build/ — so
// this block is intentionally skipped there.
const buildPath = path.join(__dirname, '../build');
if (!process.env.VERCEL && process.env.NODE_ENV !== 'development' && fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    app.get('*', (req, res) => {
        // Admin-panel, CMS asset, and media paths must never reach this SPA
        // fallback.  They are intercepted by the CMS proxy middleware above.
        // This guard exists as a safety net: if they do somehow slip through
        // (e.g. proxy middleware not yet initialised), return 404 rather than
        // serving index.html, which would cause React Router's catch-all to
        // silently redirect the browser to /.
        // Match only the exact path segments used by the CMS proxy.
        // Test for "/admin", "/admin/", "/admin/anything" — but not
        // "/admin-foo" — by checking that the character immediately after
        // the prefix is either absent, a slash, or a query string.
        const isCmsPath = (prefix) =>
            req.path === prefix ||
            req.path.startsWith(prefix + '/');
        if (isCmsPath('/admin') || isCmsPath('/_next') || isCmsPath('/media')) {
            return res.status(404).send('Not found');
        }
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;