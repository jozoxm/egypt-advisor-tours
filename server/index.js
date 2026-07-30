// 1. Core Environmental Initializations
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Admin Panel Connection
const setupAdmin = require('./adminSetup');

// Constants & Configurations
const DEFAULT_PUBLIC_SITE_URL = 'https://egyptadvisortours.com';
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_PUBLIC_SITE_URL;

const ADMIN_COOKIE_NAME = 'admin_session';
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

const app = express();

// Trust reverse proxies (Vercel, Hostinger, Nginx) for rate-limiting
app.set('trust proxy', 1);

// ============================================
// SECURITY HEADERS & CORS (helmet)
// ============================================
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            frameAncestors: ["'self'"],
            objectSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'sameorigin' },
}));

const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? 'https://egyptadvisortours.com' : undefined);
const corsOptions = corsOrigin
    ? { origin: corsOrigin, optionsSuccessStatus: 200, credentials: true }
    : { credentials: true };

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Static Uploads Middleware
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

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

const STATIC_FILE_EXTENSIONS = /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/i;

// ============================================
// CUSTOM SECURITY MIDDLEWARES
// ============================================

function parseOrigin(origin) {
    if (!origin || typeof origin !== 'string') {
        return null;
    }
    const trimmed = origin.trim();
    if (!trimmed || trimmed.toLowerCase() === 'null') {
        return null;
    }
    try {
        const url = new URL(trimmed);
        return url.origin;
    } catch {
        return trimmed;
    }
}

function isLocalhost(origin) {
    if (!origin) return false;
    const lower = origin.toLowerCase();
    return lower.includes('localhost') || lower.includes('127.0.0.1') || lower.includes('::1');
}

const ORIGIN_LOG_REJECTED = process.env.ORIGIN_LOG_REJECTED === '1';

// Origin Enforcement
app.use((req, res, next) => {
    const isAdminPath = req.path === '/admin' || req.path.startsWith('/admin/');
    if (isAdminPath) {
        res.removeHeader('X-Frame-Options');
    }

    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }

    const rawOrigin = req.get('origin');
    const normalizedOrigin = parseOrigin(rawOrigin);

    if (!normalizedOrigin) {
        return next();
    }

    const host = req.get('host');

    if (isLocalhost(normalizedOrigin)) {
        return next();
    }

    let sameOrigin = false;
    if (host) {
        try {
            sameOrigin = normalizedOrigin === `http://${host}` || normalizedOrigin === `https://${host}`;
        } catch {
            sameOrigin = false;
        }
    }

    if (sameOrigin || allowedOrigins.has(normalizedOrigin)) {
        return next();
    }

    if (ORIGIN_LOG_REJECTED) {
        console.warn('[OriginBlocked]', {
            method: req.method,
            path: req.path,
            origin: rawOrigin,
            normalizedOrigin,
            host,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            timestamp: new Date().toISOString(),
        });
    }

    return res.status(403).json({ error: 'Cross-site requests are not allowed.' });
});

// CSRF Validation
app.use((req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }

    const cookieToken = req.cookies && req.cookies[ADMIN_COOKIE_NAME];
    if (!cookieToken) return next();

    const csrfCookie = req.cookies && req.cookies[CSRF_COOKIE_NAME];
    const csrfHeader = req.get(CSRF_HEADER_NAME);
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
        return res.status(403).json({ error: 'Invalid or missing CSRF token.' });
    }

    return next();
});

// ============================================
// ROUTES
// ============================================

// Admin auth, admin pages, and bookings
setupAdmin(app);

// Admin content management API (protected by admin auth + CSRF)
const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);

// API welcome
app.get('/api', (req, res) => {
    res.status(200).json({ message: 'Egypt Advisor Tours API' });
});

// Liveness probe (independent of DB / CMS)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.get('/debug/listening', (req, res) => {
    const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' ||
                        req.socket.remoteAddress === '127.0.0.1' || req.socket.remoteAddress === '::1';
    if (!isLocalhost) {
        return res.status(404).json({ error: 'Not found' });
    }
    const address = __serverInstance ? __serverInstance.address() : { address: 'unknown', port: process.env.PORT || 5000 };
    res.status(200).json({
        address: address.address,
        port: address.port,
        host: address.address === '::' ? '0.0.0.0' : address.address,
        adminUsernameLoaded: !!process.env.ADMIN_USERNAME,
        adminPasswordLoaded: !!process.env.ADMIN_PASSWORD,
        adminSecretLoaded: !!process.env.ADMIN_SECRET,
        corsOrigin: process.env.CORS_ORIGIN || null,
        nodeEnv: process.env.NODE_ENV || null,
    });
});

app.get('/debug/env-check', (req, res) => {
    const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' ||
                        req.socket.remoteAddress === '127.0.0.1' || req.socket.remoteAddress === '::1';
    if (!isLocalhost) {
        return res.status(404).json({ error: 'Not found' });
    }
    res.status(200).json({
        adminUsernameLoaded: !!process.env.ADMIN_USERNAME,
        adminPasswordLoaded: !!process.env.ADMIN_PASSWORD,
        adminSecretLoaded: !!process.env.ADMIN_SECRET,
        corsOrigin: process.env.CORS_ORIGIN || null,
        nodeEnv: process.env.NODE_ENV || null,
    });
});

// SEO discovery endpoints
app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(
        `User-agent: *\nAllow: /\nSitemap: ${PUBLIC_SITE_URL}/sitemap.xml\n`
    );
});

app.get('/sitemap.xml', (req, res) => {
    const urls = [
        '/', '/tours', '/tours/1', '/blogs', '/destinations',
        '/special-offers', '/about', '/faq', '/contact', '/tailor-trip',
    ];
    const body = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map((u) => `  <url><loc>${PUBLIC_SITE_URL}${u}</loc></url>`),
        '</urlset>',
    ].join('\n');
    res.type('application/xml').send(body);
});

// ============================================
// RATE LIMITS
// ============================================
const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
});
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', publicLimiter);
app.use('/api/admin', adminLimiter);

// ============================================
// PUBLIC CMS API (local data only)
// ============================================
const cmsRouter = require('./routes/cms');
app.use('/api', cmsRouter);

// ============================================
// STATIC CLIENT BUILD + SPA FALLBACK
// ============================================
const possibleBuildDirs = [
    path.join(__dirname, '..', 'client', 'build'),
    path.join(__dirname, '..', 'build'),
];

const buildDir = possibleBuildDirs.find((dir) => fs.existsSync(dir));

if (buildDir) {
    app.use(express.static(buildDir));
    app.get('*', (req, res) => {
        res.sendFile(path.join(buildDir, 'index.html'));
    });
}

// ============================================
// SERVER LIFECYCLE INITIALIZATION
// ============================================

module.exports = app;

// Hostinger Node.js hosting expects the entry file to call listen() at the
// top level. Guard it behind test mode instead of `require.main` so both
// direct execution and test suites remain compatible.
let __serverInstance = null;

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    if (!process.env.PORT) {
        console.warn('[startup] WARNING: process.env.PORT is not set. Falling back to port 3000.');
    }
    __serverInstance = app.listen(PORT, '0.0.0.0', () => {
        const address = __serverInstance.address();
        const host = address.address === '::' ? '0.0.0.0' : address.address;
        console.log(`[startup] Server is listening on ${host}:${address.port}`);
        console.log(`[startup] ADMIN_USERNAME=${process.env.ADMIN_USERNAME ? 'loaded' : 'MISSING'}`);
        console.log(`[startup] ADMIN_PASSWORD=${process.env.ADMIN_PASSWORD ? 'loaded' : 'MISSING'}`);
        console.log(`[startup] ADMIN_SECRET=${process.env.ADMIN_SECRET ? 'loaded' : 'MISSING'}`);
        console.log(`[startup] CORS_ORIGIN=${process.env.CORS_ORIGIN || 'not set'}`);
        console.log(`[startup] NODE_ENV=${process.env.NODE_ENV || 'not set'}`);
    });
}
