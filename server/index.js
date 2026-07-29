// 1. Core Environmental Initializations
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Admin Panel Connection
const setupAdmin = require('./adminSetup');

// Constants & Configurations
const DEFAULT_PUBLIC_SITE_URL = 'https://egyptadvisortours.com';
const DEFAULT_PRERENDER_TIMEOUT_MS = 3000;
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_PUBLIC_SITE_URL;
const PRERENDER_TOKEN = process.env.PRERENDER_TOKEN || '';
const PRERENDER_SERVICE_URL = process.env.PRERENDER_SERVICE_URL || 'https://service.prerender.io';

const PRERENDER_TIMEOUT_MS = (() => {
    const parsed = parseInt(process.env.PRERENDER_TIMEOUT_MS || String(DEFAULT_PRERENDER_TIMEOUT_MS), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PRERENDER_TIMEOUT_MS;
})();

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
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdn.emailjs.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://api.emailjs.com"],
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

const BOT_USER_AGENTS = /bot|crawler|spider|google|bing|yandex/i;
const STATIC_FILE_EXTENSIONS = /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/i;

// ============================================
// CUSTOM SECURITY MIDDLEWARES
// ============================================

// Origin Enforcement
app.use((req, res, next) => {
    const isAdminPath = req.path === '/admin' || req.path.startsWith('/admin/');
    if (isAdminPath) {
        res.removeHeader('X-Frame-Options');
    }

    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
        return next();
    }

    const origin = req.get('origin');
    if (!origin) return next();

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

// SEO Prerender Middleware
app.use(async (req, res, next) => {
    if (!PRERENDER_TOKEN || (req.method !== 'GET' && req.method !== 'HEAD')) {
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
    if (!isCrawler) return next();

    const fullUrl = `${PUBLIC_SITE_URL}${req.originalUrl || req.url}`;
    const prerenderTarget = `${PRERENDER_SERVICE_URL.replace(/\/+$/, '')}/${encodeURIComponent(fullUrl)}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), PRERENDER_TIMEOUT_MS);

        const response = await fetch(prerenderTarget, {
            headers: { 'X-Prerender-Token': PRERENDER_TOKEN },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const text = await response.text();
        return res.send(text);
    } catch (_err) {
        return next();
    }
});

// ============================================
// ROUTES
// ============================================

// Admin auth, admin pages, and bookings
setupAdmin(app);

const bookingsRouter = require('./routes/bookings');

app.use('/api/bookings', bookingsRouter);

// API welcome
app.get('/api', (req, res) => {
    res.status(200).json({ message: 'Egypt Advisor Tours API' });
});

// Liveness probe (independent of DB / CMS)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
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
// DATABASE & SERVER LIFECYCLE INITIALIZATION
// ============================================
const shouldConnectDb = Boolean(process.env.MONGODB_URI);

if (shouldConnectDb) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB successfully'))
        .catch((err) => console.error('Database connection failed:', err.message));
}

module.exports = app;

// Hostinger Node.js hosting expects the entry file to call listen() at the
// top level. Guard it behind test mode instead of `require.main` so both
// direct execution and test suites remain compatible.
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
