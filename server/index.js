const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const {
    fetchStoryblokResource,
    getStoryblokAdminUrl,
    getStoryblokVersion,
    isStoryblokConfigured,
    updateStoryblokResource,
} = require('./storyblok');
const {
    fetchWordpressResource,
    getWordpressAdminUrl,
    isWordpressConfigured,
    pingWordpress,
} = require('./wordpress');
const { VALID_CMS_PROVIDERS } = require('./cms-config');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DEFAULT_PUBLIC_SITE_URL = 'https://egyptadvisortours.com';
const DEFAULT_PUBLIC_SITE_ORIGIN = new URL(DEFAULT_PUBLIC_SITE_URL).origin;
const DEFAULT_PRERENDER_TIMEOUT_MS = 3000;
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_PUBLIC_SITE_URL;
const PRERENDER_TOKEN = process.env.PRERENDER_TOKEN || '';
const PRERENDER_SERVICE_URL = process.env.PRERENDER_SERVICE_URL || 'https://service.prerender.io';
const PRERENDER_TIMEOUT_MS = (() => {
    const parsed = parseInt(process.env.PRERENDER_TIMEOUT_MS || String(DEFAULT_PRERENDER_TIMEOUT_MS), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PRERENDER_TIMEOUT_MS;
})();

// Trust Vercel's (and other reverse-proxy's) X-Forwarded-For header so that
// req.ip reflects the real client IP.  This is required for the rate-limiter
// to work correctly behind Vercel's infrastructure.
app.set('trust proxy', 1);

// ============================================
// SECURITY HEADERS (helmet)
// ============================================
// Storyblok's visual editor embeds the site in an iframe, so frame ancestors
// must explicitly allow Storyblok while still blocking arbitrary framing.
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
            frameAncestors: ["'self'", "https://app.storyblok.com", "https://*.storyblok.com"],
            objectSrc: ["'none'"],
        },
    },
    // Strict-Transport-Security is sent automatically by helmet
    crossOriginEmbedderPolicy: false, // Allow Unsplash images
    frameguard: { action: 'sameorigin' },
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

const allowedOrigins = new Set(
    [
        corsOrigin,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'https://egyptadvisortours.com',
    ].filter(Boolean)
);

const BOT_USER_AGENTS =
    /bot|crawler|spider|crawling|google|bing|yandex|duckduck|slurp|baiduspider|facebookexternalhit|twitterbot|linkedinbot/i;
const STATIC_FILE_EXTENSIONS =
    /\.(?:js|mjs|css|png|jpg|jpeg|gif|svg|webp|avif|ico|map|txt|xml|pdf|woff2?|ttf|eot)$/i;

function parseOrigin(value) {
    if (!value) {
        return null;
    }

    try {
        return new URL(String(value)).origin;
    } catch (_error) {
        return null;
    }
}

app.use((req, res, next) => {
    const isAdminPath = req.path === '/admin' || req.path.startsWith('/admin/');
    if (getStoryblokVersion(req) === 'draft' || isAdminPath) {
        res.removeHeader('X-Frame-Options');
    }

    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }

    const origin = req.get('origin');
    if (!origin) {
        return next();
    }

    let normalizedOrigin;
    try {
        normalizedOrigin = new URL(origin).origin;
    } catch (_error) {
        return res.status(403).json({ error: 'Invalid request origin.' });
    }

    if (!allowedOrigins.has(normalizedOrigin)) {
        return res.status(403).json({ error: 'Cross-site requests are not allowed.' });
    }

    return next();
});

app.use((req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }

    const cookieToken = req.cookies && req.cookies[ADMIN_COOKIE_NAME];
    if (!cookieToken) {
        return next();
    }

    const csrfCookie = req.cookies && req.cookies[CSRF_COOKIE_NAME];
    const csrfHeader = req.get(CSRF_HEADER_NAME);
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return res.status(403).json({ error: 'Invalid or missing CSRF token.' });
    }

    return next();
});

app.use(async (req, res, next) => {
    if (!PRERENDER_TOKEN) {
        return next();
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return next();
    }
    if (req.path.startsWith('/api') || req.path.startsWith('/admin') || req.path === '/health') {
        return next();
    }
    if (STATIC_FILE_EXTENSIONS.test(req.path)) {
        return next();
    }

    const userAgent = req.get('user-agent') || '';
    const isCrawler = BOT_USER_AGENTS.test(userAgent) || Object.hasOwn(req.query, '_escaped_fragment_');
    if (!isCrawler) {
        return next();
    }

    const baseUrl = getBaseSiteUrl();
    const fullUrl = `${baseUrl}${req.originalUrl || req.url}`;
    const prerenderTarget = `${PRERENDER_SERVICE_URL.replace(/\/+$/, '')}/${encodeURIComponent(fullUrl)}`;
    let timeoutId;

    try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), PRERENDER_TIMEOUT_MS);
        const prerenderResponse = await fetch(prerenderTarget, {
            headers: {
                'X-Prerender-Token': PRERENDER_TOKEN,
                'User-Agent': userAgent,
            },
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!prerenderResponse.ok) {
            return next();
        }

        const body = await prerenderResponse.text();
        const contentType = prerenderResponse.headers.get('content-type') || 'text/html; charset=utf-8';
        res.status(prerenderResponse.status);
        res.set('Content-Type', contentType);
        return res.send(body);
    } catch (_error) {
        clearTimeout(timeoutId);
        return next();
    }
});

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
const CSRF_COOKIE_NAME = 'adminCsrfToken';
const CSRF_HEADER_NAME = 'x-csrf-token';
const ADMIN_LOGIN_PATH = '/admin/login';
const PREVIEW_MODE_DRAFT = 'draft';

function getAdminCookieOptions() {
    const secure = process.env.NODE_ENV === 'production';
    return {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure,
        maxAge: 24 * 60 * 60 * 1000,
    };
}

function getCsrfCookieOptions() {
    const secure = process.env.NODE_ENV === 'production';
    return {
        path: '/',
        httpOnly: false,
        sameSite: 'strict',
        secure,
        maxAge: 24 * 60 * 60 * 1000,
    };
}

function getPreviewCookieOptions() {
    const secure = process.env.NODE_ENV === 'production';
    return {
        path: '/',
        httpOnly: true,
        sameSite: secure ? 'none' : 'lax',
        secure,
        maxAge: 60 * 60 * 1000,
    };
}

function issueAdminSessionAndCsrfCookies(res, token) {
    const csrfToken = crypto.randomBytes(32).toString('hex');

    res.cookie(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());
    res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions());
}

function isAdminAuthenticated(req) {
    if (!ADMIN_PASSWORD) {
        return true;
    }

    const cookieToken = req.cookies && req.cookies[ADMIN_COOKIE_NAME];
    if (cookieToken) {
        try {
            jwt.verify(cookieToken, JWT_SECRET);
            return true;
        } catch {
            return false;
        }
    }

    const legacyToken = req.headers['x-admin-secret'] || '';
    return Boolean(legacyToken && legacyToken === ADMIN_SECRET);
}

// Strict rate-limiter for the login endpoint to slow brute-force attempts.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again later.' }
});

const requireAdminAuth = (req, res, next) => {
    if (isAdminAuthenticated(req)) {
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

// Resolves with the result of `promise` if it settles within `ms` milliseconds;
// rejects with a timeout error otherwise.  The timeout is configurable via
// environment variables so operators can tune it without code changes.
// A `settled` flag ensures the outer Promise is resolved/rejected exactly once
// even when the original promise settles concurrently with the timer.
function withTimeout(promise, ms, label) {
    return new Promise((resolve, reject) => {
        let settled = false;
        const timer = setTimeout(() => {
            if (!settled) {
                settled = true;
                reject(Object.assign(new Error(`${label || 'operation'} timed out after ${ms}ms`), { code: 'ETIMEDOUT' }));
            }
        }, ms);
        promise.then(
            (value) => { clearTimeout(timer); if (!settled) { settled = true; resolve(value); } },
            (err)   => { clearTimeout(timer); if (!settled) { settled = true; reject(err); } }
        );
    });
}

function parsePositiveInt(value, fallback) {
    const parsed = parseInt(value, 10);
    if (value !== undefined && value !== null && !(Number.isFinite(parsed) && parsed > 0)) {
        console.warn(`[config] Invalid timeout value "${value}" (expected a positive integer); using default ${fallback}ms.`);
    }
    return (Number.isFinite(parsed) && parsed > 0) ? parsed : fallback;
}

const STORYBLOK_TIMEOUT_MS = parsePositiveInt(process.env.STORYBLOK_TIMEOUT_MS, 5000);
const STORYBLOK_HEALTH_TIMEOUT_MS = parsePositiveInt(process.env.STORYBLOK_HEALTH_TIMEOUT_MS, 3000);
const WORDPRESS_TIMEOUT_MS = parsePositiveInt(process.env.WORDPRESS_TIMEOUT_MS, 5000);
const WORDPRESS_HEALTH_TIMEOUT_MS = parsePositiveInt(process.env.WORDPRESS_HEALTH_TIMEOUT_MS, 3000);

function getCmsProvider() {
    const configuredProvider = String(process.env.CMS_PROVIDER || 'auto').toLowerCase();
    if (VALID_CMS_PROVIDERS.includes(configuredProvider)) {
        return configuredProvider;
    }

    if (isStoryblokConfigured()) {
        return 'storyblok';
    }
    if (isWordpressConfigured()) {
        return 'wordpress';
    }
    return 'filesystem';
}

async function readCmsContent(key, req, jsRegex) {
    const provider = getCmsProvider();

    if (provider === 'wordpress') {
        try {
            const wordpressData = await withTimeout(
                fetchWordpressResource(key),
                WORDPRESS_TIMEOUT_MS,
                `WordPress fetch "${key}"`
            );
            if (wordpressData) {
                store[key] = wordpressData;
                return wordpressData;
            }
        } catch (error) {
            console.warn(`[WordPress] Failed to load "${key}" from WordPress:`, error.message);
        }
        // In explicit WordPress mode, do not silently fall back to local files.
        // This keeps website content in sync with the CMS source of truth.
        return null;
    }

    if (provider === 'storyblok') {
        try {
            const storyblokData = await withTimeout(
                fetchStoryblokResource(key, { source: req }),
                STORYBLOK_TIMEOUT_MS,
                `Storyblok fetch "${key}"`
            );
            if (storyblokData) {
                store[key] = storyblokData;
                return storyblokData;
            }
        } catch (error) {
            console.warn(`[Storyblok] Failed to load "${key}" from Storyblok:`, error.message);
        }
    }

    const fallbackData = readData(key, jsRegex);
    if (fallbackData) {
        store[key] = fallbackData;
        return fallbackData;
    }

    return null;
}

async function persistCmsContent(key, data) {
    if (getCmsProvider() === 'storyblok') {
        try {
            const result = await updateStoryblokResource(key, data);
            if (result.persisted) {
                return { persisted: true, provider: 'storyblok' };
            }
        } catch (error) {
            console.warn(`[Storyblok] Failed to save "${key}" to Storyblok:`, error.message);
            return { persisted: false, provider: 'storyblok', error };
        }
    }

    return { persisted: writeData(key, data), provider: 'filesystem' };
}

// Only reuse the in-memory store for filesystem mode. External CMS providers
// (WordPress/Storyblok) must re-fetch so admin-side edits are reflected quickly.
// Storyblok draft/preview requests also always bypass cache.
function shouldUseMemoryStore(req) {
    return getCmsProvider() === 'filesystem' && getStoryblokVersion(req) === 'published';
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

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getBaseSiteUrl() {
    const explicitOrigin = parseOrigin(String(PUBLIC_SITE_URL || '').trim());
    if (explicitOrigin) {
        return explicitOrigin;
    }

    return DEFAULT_PUBLIC_SITE_ORIGIN;
}

function buildAbsoluteUrl(baseUrl, routePath = '/') {
    const normalizedBase = String(baseUrl || '').replace(/\/+$/, '');
    const normalizedPath = routePath.startsWith('/') ? routePath : `/${routePath}`;
    return `${normalizedBase}${normalizedPath}`;
}

function normalizeCollection(data, key) {
    if (Array.isArray(data)) {
        return data;
    }
    if (data && Array.isArray(data[key])) {
        return data[key];
    }
    return [];
}

function readSeoCollections() {
    const toursData =
        store.tours ||
        readData('tours', /export const tours = (\[[\s\S]*?\]);[\s\S]*export const testimonials = (\[[\s\S]*?\]);/) ||
        { tours: [] };
    const blogsData =
        store.blogs ||
        readData('blogs', /export const blogs = (\[[\s\S]*?\]);/) ||
        { blogs: [] };

    return {
        tours: normalizeCollection(toursData, 'tours'),
        blogs: normalizeCollection(blogsData, 'blogs'),
    };
}

function getAdminFrameSources(storyblokAdminUrl) {
    const sources = new Set([
        'https://app.storyblok.com',
        'https://*.storyblok.com',
    ]);

    try {
        const origin = new URL(storyblokAdminUrl).origin;
        if (origin) {
            sources.add(origin);
        }
    } catch (_error) {
        // Ignore invalid URL values and fall back to Storyblok defaults.
    }

    return [...sources].join(' ');
}

function getAdminPageCsp(nonce, storyblokAdminUrl) {
    return [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}'`,
        `style-src 'self' 'nonce-${nonce}'`,
        "img-src 'self' data:",
        "connect-src 'self'",
        `frame-src ${getAdminFrameSources(storyblokAdminUrl)}`,
        "frame-ancestors 'self'",
        "base-uri 'none'",
        "object-src 'none'",
    ].join('; ');
}

function renderAdminLoginPage() {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Admin Login</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; background: #0b1220; color: #e5e7eb; min-height: 100vh; display: grid; place-items: center; }
    .card { width: min(420px, calc(100vw - 32px)); background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; box-sizing: border-box; }
    h1 { font-size: 1.1rem; margin: 0 0 12px; }
    p { margin: 0 0 14px; color: #9ca3af; }
    label { display: block; margin-bottom: 6px; font-size: 0.9rem; }
    input { width: 100%; box-sizing: border-box; border: 1px solid #374151; border-radius: 8px; background: #0f172a; color: #f9fafb; padding: 10px; margin-bottom: 12px; }
    button { width: 100%; border: 0; border-radius: 8px; padding: 10px; background: #2563eb; color: #fff; font-weight: 600; cursor: pointer; }
    #error { min-height: 20px; color: #fca5a5; font-size: 0.9rem; margin-bottom: 10px; }
  </style>
</head>
<body>
  <main class="card">
    <h1>Admin login</h1>
    <p>Sign in to open the Storyblok editor launcher and preview controls.</p>
    <form id="login-form">
      <label for="username">Username</label>
      <input id="username" name="username" autocomplete="username" />
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required />
      <div id="error"></div>
      <button type="submit">Sign in</button>
    </form>
  </main>
  <script>
    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('error');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      errorEl.textContent = '';
      const payload = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
      };
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        errorEl.textContent = body.error || 'Login failed.';
        return;
      }
      window.location.href = '/admin';
    });
  </script>
</body>
</html>`;
}

function renderAdminShellPage(storyblokAdminUrl, nonce) {
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Admin Editor</title>
  <style nonce="${nonce}">
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #e5e7eb; background: #0b1220; }
    .layout { display: grid; grid-template-columns: 280px 1fr; min-height: 100vh; }
    aside { background: #111827; border-right: 1px solid #1f2937; padding: 16px; box-sizing: border-box; }
    h1 { font-size: 1rem; margin: 0 0 8px; }
    .hint { color: #9ca3af; font-size: 0.85rem; margin: 0 0 12px; }
    .status { margin: 0 0 16px; font-size: 0.9rem; padding: 8px; border-radius: 8px; background: #0f172a; border: 1px solid #1f2937; }
    .status[data-active="true"] { border-color: #065f46; color: #86efac; }
    .actions { display: grid; gap: 8px; }
    button, a { appearance: none; border: 1px solid #374151; background: #1f2937; color: #f3f4f6; border-radius: 8px; padding: 10px 12px; font-size: 0.9rem; text-decoration: none; text-align: center; cursor: pointer; }
    button.primary { background: #2563eb; border-color: #2563eb; color: #fff; }
    main { background: #030712; display: grid; place-items: center; padding: 24px; box-sizing: border-box; }
    .panel { width: min(720px, 100%); background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 18px; box-sizing: border-box; color: #d1d5db; }
    .panel h2 { margin: 0 0 10px; font-size: 1.05rem; color: #f9fafb; }
    .panel p { margin: 0 0 10px; line-height: 1.5; }
    .panel code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #0f172a; border: 1px solid #1f2937; border-radius: 6px; padding: 2px 6px; }
    .panel a.launch { display: inline-block; margin-top: 6px; border-color: #2563eb; background: #2563eb; color: #fff; }
  </style>
</head>
<body>
  <div class="layout">
    <aside>
      <h1>Egypt Advisor Admin</h1>
      <p class="hint">Storyblok editor launcher + preview controls</p>
      <div id="preview-status" class="status" data-active="false">Preview: checking…</div>
      <div class="actions">
        <button id="enable-preview" class="primary" type="button">Enable preview mode</button>
        <button id="exit-preview" type="button">Exit preview mode</button>
        <a href="/api/admin/preview/exit" target="_blank" rel="noreferrer">Open preview-exit URL</a>
        <button id="switch-account" type="button">Switch account</button>
      </div>
    </aside>
    <main>
      <section class="panel">
        <h2>Open Storyblok Visual Editor</h2>
        <p>Storyblok blocks embedding <code>app.storyblok.com</code> in third-party iframes.</p>
        <p>Use the button below to open the editor directly in a new tab, then keep this admin panel open to manage preview mode.</p>
        <a class="launch" href="${escapeHtml(storyblokAdminUrl)}" target="_blank" rel="noreferrer">Open Storyblok editor</a>
      </section>
    </main>
  </div>
  <script nonce="${nonce}">
    const statusEl = document.getElementById('preview-status');
    const getCookie = (name) => {
      const value = document.cookie.split(';').map((entry) => entry.trim()).find((entry) => entry.startsWith(name + '='));
      return value ? decodeURIComponent(value.split('=').slice(1).join('=')) : '';
    };

    const csrfToken = () => getCookie('adminCsrfToken');

    const updateStatus = async () => {
      const response = await fetch('/api/admin/preview/status', { credentials: 'same-origin' });
      if (!response.ok) {
        statusEl.textContent = 'Preview: unavailable';
        statusEl.dataset.active = 'false';
        return;
      }
      const body = await response.json();
      statusEl.textContent = body.active ? 'Preview: draft (active)' : 'Preview: published';
      statusEl.dataset.active = body.active ? 'true' : 'false';
    };

    const postAction = async (path) => {
      const response = await fetch(path, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'x-csrf-token': csrfToken() },
      });
      if (response.ok) {
        await updateStatus();
      } else {
        statusEl.textContent = 'Action failed. Please refresh.';
      }
    };

    document.getElementById('enable-preview').addEventListener('click', () => postAction('/api/admin/preview/enable'));
    document.getElementById('exit-preview').addEventListener('click', () => postAction('/api/admin/preview/exit'));
    document.getElementById('switch-account').addEventListener('click', async () => {
      await postAction('/api/admin/logout');
      window.location.href = '/admin/login?force=1';
    });
    updateStatus();
  </script>
</body>
</html>`;
}

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

app.get('/admin/login', readLimiter, (req, res) => {
    if (isAdminAuthenticated(req) && req.query.force !== '1') {
        return res.redirect(302, '/admin');
    }
    return res.status(200).type('html').send(renderAdminLoginPage());
});

app.get(['/admin', '/admin/*'], readLimiter, (req, res) => {
    if (!isAdminAuthenticated(req)) {
        return res.redirect(302, ADMIN_LOGIN_PATH);
    }

    if (getCmsProvider() === 'wordpress') {
        return res.redirect(302, getWordpressAdminUrl());
    }

    const adminUrl = getStoryblokAdminUrl();
    const nonce = crypto.randomBytes(16).toString('base64');
    res.setHeader('Content-Security-Policy', getAdminPageCsp(nonce, adminUrl));
    res.removeHeader('X-Frame-Options');
    return res.status(200).type('html').send(renderAdminShellPage(adminUrl, nonce));
});

// ============================================
// CMS HEALTH ENDPOINT
// ============================================
// GET /api/admin/health
// Checks Storyblok delivery access so operators can quickly verify that the
// content source is reachable from the server.
//
// In production the response body is intentionally minimal — no internal
// URLs, error codes, or hints — to avoid leaking infrastructure details.
// In non-production (development / test) the full diagnostics are included.
//
// Response shape:
//   200  { status: 'ok',       cms: 'up',   ...diagnostics? }
//   503  { status: 'degraded', cms: 'down', ...diagnostics? }
app.get('/api/admin/health', async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const provider = getCmsProvider();

    if (provider === 'wordpress') {
        if (!isWordpressConfigured()) {
            const body = { status: 'degraded', cms: 'down' };
            if (!isProduction) {
                body.errorCode = 'WORDPRESS_NOT_CONFIGURED';
                body.hint = 'Set WORDPRESS_BASE_URL and/or CMS_PROVIDER=wordpress.';
            }
            return res.status(503).json(body);
        }

        try {
            await withTimeout(pingWordpress(), WORDPRESS_HEALTH_TIMEOUT_MS, 'WordPress health probe');
            const body = { status: 'ok', cms: 'up' };
            if (!isProduction) {
                body.provider = 'wordpress';
            }
            return res.status(200).json(body);
        } catch (error) {
            const body = { status: 'degraded', cms: 'down' };
            if (!isProduction) {
                body.errorCode = error.code || error.message;
                body.hint = error.code === 'ETIMEDOUT'
                    ? `WordPress did not respond within ${WORDPRESS_HEALTH_TIMEOUT_MS}ms. Check network connectivity or increase WORDPRESS_HEALTH_TIMEOUT_MS.`
                    : 'Verify WORDPRESS_BASE_URL is reachable and exposes /wp-json/.';
            }
            return res.status(503).json(body);
        }
    }

    if (provider === 'filesystem') {
        const body = { status: 'ok', cms: 'up' };
        if (!isProduction) {
            body.provider = 'filesystem';
            body.hint = 'Using local JSON/filesystem content store.';
        }
        return res.status(200).json(body);
    }

    if (provider !== 'storyblok') {
        const body = { status: 'degraded', cms: 'down' };
        if (!isProduction) {
            body.errorCode = 'CMS_NOT_CONFIGURED';
            body.hint = 'Set CMS_PROVIDER=wordpress with WORDPRESS_BASE_URL, or configure Storyblok with STORYBLOK_PREVIEW_TOKEN.';
        }
        return res.status(503).json(body);
    }

    if (!isStoryblokConfigured()) {
        const body = { status: 'degraded', cms: 'down' };
        if (!isProduction) {
            body.errorCode = 'STORYBLOK_NOT_CONFIGURED';
            body.hint = 'Set STORYBLOK_PREVIEW_TOKEN (and optionally STORYBLOK_SPACE_ID / STORYBLOK_MANAGEMENT_TOKEN).';
        }
        return res.status(503).json(body);
    }

    try {
        await withTimeout(
            fetchStoryblokResource('settings', { source: req, version: getStoryblokVersion(req) }),
            STORYBLOK_HEALTH_TIMEOUT_MS,
            'Storyblok health probe'
        );
        const body = { status: 'ok', cms: 'up' };
        if (!isProduction) {
            body.provider = 'storyblok';
            body.version = getStoryblokVersion(req);
        }
        return res.status(200).json(body);
    } catch (error) {
        const body = { status: 'degraded', cms: 'down' };
        if (!isProduction) {
            body.errorCode = error.code || error.message;
            body.hint = error.code === 'ETIMEDOUT'
                ? `Storyblok did not respond within ${STORYBLOK_HEALTH_TIMEOUT_MS}ms. Check network reachability or increase STORYBLOK_HEALTH_TIMEOUT_MS.`
                : 'Verify STORYBLOK_PREVIEW_TOKEN, STORYBLOK_REGION, and the configured Storyblok story slugs.';
        }
        return res.status(503).json(body);
    }
});

app.use('/api/admin/preview', (req, res, next) => {
    if (getCmsProvider() !== 'storyblok') {
        return res.status(404).send('Not found');
    }
    return next();
});

app.get('/api/admin/preview/status', readLimiter, requireAdminAuth, (req, res) => {
    const active = req.cookies && req.cookies.storyblokPreview === PREVIEW_MODE_DRAFT;
    return res.json({ active, mode: active ? PREVIEW_MODE_DRAFT : 'published' });
});

app.post('/api/admin/preview/enable', writeLimiter, requireAdminAuth, (req, res) => {
    res.cookie('storyblokPreview', PREVIEW_MODE_DRAFT, getPreviewCookieOptions());
    return res.json({ success: true, mode: PREVIEW_MODE_DRAFT });
});

app.post('/api/admin/preview/exit', (req, res) => {
    const { maxAge: _maxAge, ...previewCookieOptions } = getPreviewCookieOptions();
    res.clearCookie('storyblokPreview', previewCookieOptions);
    return res.json({ success: true, message: 'Storyblok preview disabled.' });
});

app.get('/api/admin/preview/exit', (req, res) => {
    const { maxAge: _maxAge, ...previewCookieOptions } = getPreviewCookieOptions();
    res.clearCookie('storyblokPreview', previewCookieOptions);
    return res.redirect(302, '/admin');
});

app.get('/api/admin/preview/:secret', readLimiter, (req, res) => {
    const configuredSecret = process.env.STORYBLOK_PREVIEW_SECRET;
    const providedSecret = req.params.secret;

    if (process.env.NODE_ENV === 'production' && !configuredSecret) {
        return res.status(404).send('Not found');
    }

    if (configuredSecret && providedSecret !== configuredSecret) {
        return res.status(404).send('Not found');
    }

    res.cookie('storyblokPreview', PREVIEW_MODE_DRAFT, getPreviewCookieOptions());
    return res.redirect(302, '/');
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
        issueAdminSessionAndCsrfCookies(res, devToken);
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
    issueAdminSessionAndCsrfCookies(res, sessionToken);
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
    const { maxAge: _adminMaxAge, ...adminCookieOptions } = getAdminCookieOptions();
    const { maxAge: _csrfMaxAge, ...csrfCookieOptions } = getCsrfCookieOptions();
    res.clearCookie(ADMIN_COOKIE_NAME, adminCookieOptions);
    res.clearCookie(CSRF_COOKIE_NAME, csrfCookieOptions);
    res.json({ success: true, message: 'Logged out.' });
});

// ============================================
// TOURS API ENDPOINTS
// ============================================

app.get('/api/tours', readLimiter, async (req, res) => {
    if (shouldUseMemoryStore(req) && store.tours) return res.json(store.tours);
    const data = await readCmsContent('tours', req, /export const tours = (\[[\s\S]*?\]);[\s\S]*export const testimonials = (\[[\s\S]*?\]);/);
    if (data) {
        return res.json(data);
    }
    if (getCmsProvider() === 'wordpress') {
        return res.status(500).json({ error: 'Failed to read tours data from WordPress' });
    }
    // Try extracting separately
    const jsContent = fs.existsSync(JS_FILES.tours) ? fs.readFileSync(JS_FILES.tours, 'utf8') : '';
    const toursMatch = jsContent.match(/export const tours = (\[[\s\S]*?\]);/);
    const testimonialsMatch = jsContent.match(/export const testimonials = (\[[\s\S]*?\]);/);
    if (toursMatch) {
        const fallback = {
            tours: JSON.parse(toursMatch[1]),
            testimonials: testimonialsMatch ? JSON.parse(testimonialsMatch[1]) : []
        };
        if (shouldUseMemoryStore(req)) {
            store.tours = fallback;
        }
        return res.json(fallback);
    }
    res.status(500).json({ error: 'Failed to read tours data' });
});

app.post('/api/tours', writeLimiter, requireAdminAuth, async (req, res) => {
    const err = validateArray(req.body, 'tours');
    if (err) return res.status(400).json({ error: err });
    try {
        const tours = sanitize(req.body.tours);
        const testimonials = sanitize(req.body.testimonials || []);
        const content = { tours, testimonials };
        store.tours = content;
        const { persisted } = await persistCmsContent('tours', content);
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

app.get('/api/contact', readLimiter, async (req, res) => {
    if (shouldUseMemoryStore(req) && store.contact) return res.json(store.contact);
    const data = await readCmsContent('contact', req, /export const contactInfo = ({[\s\S]*?});[\s\n]*$/);
    if (data) {
        return res.json(data);
    }
    res.status(500).json({ error: 'Failed to read contact info' });
});

app.post('/api/contact', writeLimiter, requireAdminAuth, async (req, res) => {
    const err = validateObject(req.body);
    if (err) return res.status(400).json({ error: err });
    try {
        const contactInfo = sanitize(req.body);
        store.contact = contactInfo;
        const { persisted } = await persistCmsContent('contact', contactInfo);
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

app.get('/api/blogs', readLimiter, async (req, res) => {
    if (shouldUseMemoryStore(req) && store.blogs) return res.json(store.blogs);
    const data = await readCmsContent('blogs', req, /export const blogs = (\[[\s\S]*?\]);/);
    if (data) {
        return res.json(data.blogs ? data : { blogs: data });
    }
    res.status(500).json({ error: 'Failed to read blogs data' });
});

app.post('/api/blogs', writeLimiter, requireAdminAuth, async (req, res) => {
    const err = validateArray(req.body, 'blogs');
    if (err) return res.status(400).json({ error: err });
    try {
        const blogs = sanitize(req.body.blogs);
        const content = { blogs };
        store.blogs = content;
        const { persisted } = await persistCmsContent('blogs', content);
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

app.get('/api/gallery', readLimiter, async (req, res) => {
    if (shouldUseMemoryStore(req) && store.gallery) return res.json(store.gallery);
    const data = await readCmsContent('gallery', req, /export const gallery = (\[[\s\S]*?\]);/);
    if (data) {
        return res.json(data.gallery ? data : { gallery: data });
    }
    res.status(500).json({ error: 'Failed to read gallery data' });
});

app.post('/api/gallery', writeLimiter, requireAdminAuth, async (req, res) => {
    const err = validateArray(req.body, 'gallery');
    if (err) return res.status(400).json({ error: err });
    try {
        const gallery = sanitize(req.body.gallery);
        const content = { gallery };
        store.gallery = content;
        const { persisted } = await persistCmsContent('gallery', content);
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

app.get('/api/slideshow', readLimiter, async (req, res) => {
    if (shouldUseMemoryStore(req) && store.slideshow) return res.json(store.slideshow);
    const data = await readCmsContent('slideshow', req, /export const slides = (\[[\s\S]*?\]);?/);
    if (data) {
        return res.json(data.slides ? data : { slides: data });
    }
    res.status(500).json({ error: 'Failed to read slideshow data' });
});

app.post('/api/slideshow', writeLimiter, requireAdminAuth, async (req, res) => {
    const err = validateArray(req.body, 'slides');
    if (err) return res.status(400).json({ error: err });
    try {
        const slides = sanitize(req.body.slides);
        const content = { slides };
        store.slideshow = content;
        const { persisted } = await persistCmsContent('slideshow', content);
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

app.get('/api/settings', readLimiter, async (req, res) => {
    if (shouldUseMemoryStore(req) && store.settings) return res.json(store.settings);
    const data = await readCmsContent('settings', req, /export const siteSettings = ({[\s\S]*?});[\s\n]*$/);
    if (data) {
        return res.json(data);
    }
    res.status(500).json({ error: 'Failed to read site settings' });
});

app.post('/api/settings', writeLimiter, requireAdminAuth, async (req, res) => {
    const err = validateObject(req.body);
    if (err) return res.status(400).json({ error: err });
    try {
        const settings = sanitize(req.body);
        store.settings = settings;
        const { persisted } = await persistCmsContent('settings', settings);
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

app.get('/api/promotions', readLimiter, async (req, res) => {
    if (shouldUseMemoryStore(req) && store.promotions) return res.json(store.promotions);
    const data = await readCmsContent('promotions', req, /export const promotions\s*=\s*(\[[\s\S]*?\]);/);
    if (data) {
        return res.json(data.promotions ? data : { promotions: data });
    }
    // No data file yet — return an empty list rather than a 500 so the
    // front-end degrades gracefully on a fresh deployment.
    store.promotions = { promotions: [] };
    res.json(store.promotions);
});

app.post('/api/promotions', writeLimiter, requireAdminAuth, async (req, res) => {
    const err = validateArray(req.body, 'promotions');
    if (err) return res.status(400).json({ error: err });
    try {
        const promotions = sanitize(req.body.promotions);
        const content = { promotions };
        store.promotions = content;
        const { persisted } = await persistCmsContent('promotions', content);
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

app.get('/api/destinations', readLimiter, async (req, res) => {
    if (shouldUseMemoryStore(req) && store.destinations) return res.json(store.destinations);
    const data = await readCmsContent('destinations', req, /export const destinations\s*=\s*(\[[\s\S]*?\]);/);
    if (data) {
        return res.json(data.destinations ? data : { destinations: data });
    }
    store.destinations = { destinations: [] };
    res.json(store.destinations);
});

app.post('/api/destinations', writeLimiter, requireAdminAuth, async (req, res) => {
    const err = validateArray(req.body, 'destinations');
    if (err) return res.status(400).json({ error: err });
    try {
        const destinations = sanitize(req.body.destinations);
        const content = { destinations };
        store.destinations = content;
        const { persisted } = await persistCmsContent('destinations', content);
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

app.get('/robots.txt', readLimiter, (req, res) => {
    const baseUrl = getBaseSiteUrl();
    res.type('text/plain');
    res.send(
        [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin',
            'Disallow: /api/',
            `Sitemap: ${buildAbsoluteUrl(baseUrl, '/sitemap.xml')}`,
        ].join('\n')
    );
});

app.get('/sitemap.xml', readLimiter, async (req, res) => {
    const baseUrl = getBaseSiteUrl();
    const staticRoutes = [
        { path: '/', priority: '1.0', changefreq: 'weekly' },
        { path: '/tours', priority: '0.9', changefreq: 'weekly' },
        { path: '/blogs', priority: '0.8', changefreq: 'weekly' },
        { path: '/destinations', priority: '0.8', changefreq: 'weekly' },
        { path: '/special-offers', priority: '0.7', changefreq: 'weekly' },
        { path: '/about', priority: '0.7', changefreq: 'monthly' },
    ];

    try {
        const [cmsTours, cmsBlogs] = await Promise.all([
            readCmsContent('tours', req, /export const tours = (\[[\s\S]*?\]);[\s\S]*export const testimonials = (\[[\s\S]*?\]);/),
            readCmsContent('blogs', req, /export const blogs = (\[[\s\S]*?\]);/),
        ]);
        if (cmsTours?.tours) store.tours = cmsTours;
        if (cmsBlogs?.blogs) store.blogs = cmsBlogs;
    } catch (_error) {
        // Fall back to local store/data if CMS read fails.
    }

    const { tours } = readSeoCollections();
    const dynamicTourRoutes = tours
        .filter((tour) => Number.isFinite(tour?.id))
        .map((tour) => ({ path: `/tours/${tour.id}`, priority: '0.8', changefreq: 'weekly' }));

    const urls = [...staticRoutes, ...dynamicTourRoutes];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls
            .map((entry) => `  <url>\n` +
                `    <loc>${escapeHtml(buildAbsoluteUrl(baseUrl, entry.path))}</loc>\n` +
                `    <changefreq>${entry.changefreq}</changefreq>\n` +
                `    <priority>${entry.priority}</priority>\n` +
                `  </url>`)
            .join('\n') +
        `\n</urlset>`;

    res.type('application/xml');
    res.send(xml);
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
    app.use(express.static(buildPath, {
        setHeaders: (res, filePath) => {
            if (STATIC_FILE_EXTENSIONS.test(filePath) && !/index\.html$/i.test(filePath)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                return;
            }
            if (/index\.html$/i.test(filePath)) {
                res.setHeader('Cache-Control', 'no-cache');
            }
        },
    }));
    app.get('*', readLimiter, (req, res) => {
        // Admin redirects are handled above; if a request somehow reaches the
        // SPA fallback, return 404 rather than letting React Router swallow it.
        const isCmsPath = (prefix) =>
            req.path === prefix ||
            req.path.startsWith(prefix + '/');
        if (isCmsPath('/admin')) {
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
