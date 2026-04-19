/**
 * Integration tests for server/index.js
 *
 * These tests spin up the real Express application (with real middleware)
 * against a temporary DATA_PATH directory so no actual data files are read or written.
 * The tests cover a representative subset of public and admin-protected API endpoints;
 * not every endpoint is exercised.
 */

const request = require('supertest');
const path    = require('path');
const os      = require('os');
const fs      = require('fs');

// Use a temp dir for data so tests don't touch real data files.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eat-test-'));
process.env.DATA_PATH       = tmpDir;
process.env.NODE_ENV        = 'test';
process.env.ADMIN_SECRET    = 'test-jwt-secret';
process.env.ADMIN_PASSWORD  = 'test-password';
process.env.ADMIN_USERNAME  = 'testadmin';

// Load the app AFTER setting env vars.
const app = require('../index.js');
const jwt = require('jsonwebtoken');

// Helper: obtain a valid admin session cookie.
async function adminCookie() {
    const res = await request(app)
        .post('/api/admin/login')
        .send({ username: 'testadmin', password: 'test-password' });
    // Extract Set-Cookie header
    return res.headers['set-cookie'];
}

// ─────────────────────────────────────────────────
// Core / Health
// ─────────────────────────────────────────────────
describe('GET /health', () => {
    it('returns 200 with OK status', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('OK');
    });
});

describe('GET /api/admin/health', () => {
    // In the test environment the CMS process is not running, so the endpoint
    // should report the CMS as down (503) — but it must not crash Express.
    it('returns 503 with degraded status when CMS is unreachable', async () => {
        const res = await request(app).get('/api/admin/health');
        expect(res.status).toBe(503);
        expect(res.body.status).toBe('degraded');
        expect(res.body.cms).toBe('down');
    });

    it('includes diagnostic details in non-production mode', async () => {
        const res = await request(app).get('/api/admin/health');
        // NODE_ENV is 'test' so diagnostics should be included
        expect(res.body).toHaveProperty('cmsUrl');
        expect(res.body).toHaveProperty('errorCode');
        expect(res.body).toHaveProperty('hint');
    });
});

describe('GET /api', () => {
    it('returns 200 with welcome message', async () => {
        const res = await request(app).get('/api');
        expect(res.status).toBe(200);
        expect(res.body.message).toMatch(/Egypt Advisor Tours/i);
    });
});

// ─────────────────────────────────────────────────
// Admin Auth
// ─────────────────────────────────────────────────
describe('POST /api/admin/login', () => {
    it('returns 200 and sets a cookie on valid credentials', async () => {
        const res = await request(app)
            .post('/api/admin/login')
            .send({ username: 'testadmin', password: 'test-password' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.headers['set-cookie']).toBeDefined();
        expect(res.headers['set-cookie'][0]).toMatch(/adminToken=/);
        expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i);
    });

    it('returns 401 on wrong password', async () => {
        const res = await request(app)
            .post('/api/admin/login')
            .send({ username: 'testadmin', password: 'wrong-password' });
        expect(res.status).toBe(401);
        expect(res.body.error).toBeDefined();
    });

    it('returns 401 on wrong username', async () => {
        const res = await request(app)
            .post('/api/admin/login')
            .send({ username: 'hacker', password: 'test-password' });
        expect(res.status).toBe(401);
    });
});

describe('GET /api/admin/verify', () => {
    it('returns 401 when no cookie is sent', async () => {
        const res = await request(app).get('/api/admin/verify');
        expect(res.status).toBe(401);
        expect(res.body.authenticated).toBe(false);
    });

    it('returns 200 when a valid cookie is sent', async () => {
        const cookie = await adminCookie();
        const res = await request(app)
            .get('/api/admin/verify')
            .set('Cookie', cookie);
        expect(res.status).toBe(200);
        expect(res.body.authenticated).toBe(true);
    });

    it('returns 401 for a tampered/expired cookie', async () => {
        const badToken = jwt.sign({ admin: true }, 'wrong-secret', { expiresIn: '1s' });
        const res = await request(app)
            .get('/api/admin/verify')
            .set('Cookie', [`adminToken=${badToken}`]);
        expect(res.status).toBe(401);
    });
});

describe('POST /api/admin/logout', () => {
    it('returns 200 and clears the cookie', async () => {
        const cookie = await adminCookie();
        const res = await request(app)
            .post('/api/admin/logout')
            .set('Cookie', cookie);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        // The Set-Cookie header should clear the adminToken cookie
        const setCookie = (res.headers['set-cookie'] || []).join(';');
        expect(setCookie).toMatch(/adminToken=/);
    });
});

// ─────────────────────────────────────────────────
// Public endpoints
// ─────────────────────────────────────────────────
describe('GET /api/tours', () => {
    it('returns 200 with tours array', async () => {
        const res = await request(app).get('/api/tours');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('tours');
        expect(Array.isArray(res.body.tours)).toBe(true);
    });
});

describe('GET /api/contact', () => {
    it('returns 200 with contact info', async () => {
        const res = await request(app).get('/api/contact');
        expect(res.status).toBe(200);
        expect(res.body).toBeDefined();
    });
});

describe('GET /api/blogs', () => {
    it('returns 200 with blogs array', async () => {
        const res = await request(app).get('/api/blogs');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('blogs');
        expect(Array.isArray(res.body.blogs)).toBe(true);
    });
});

describe('GET /api/settings', () => {
    it('returns 200 with site settings', async () => {
        const res = await request(app).get('/api/settings');
        expect(res.status).toBe(200);
        expect(res.body).toBeDefined();
    });
});

describe('GET /api/gallery', () => {
    it('returns 200 with gallery array', async () => {
        const res = await request(app).get('/api/gallery');
        expect(res.status).toBe(200);
    });
});

describe('GET /api/slideshow', () => {
    it('returns 200 with slides', async () => {
        const res = await request(app).get('/api/slideshow');
        expect(res.status).toBe(200);
    });
});

// ─────────────────────────────────────────────────
// Admin-protected endpoints
// ─────────────────────────────────────────────────
describe('GET /api/bookings (admin protected)', () => {
    it('returns 401 without auth', async () => {
        const res = await request(app).get('/api/bookings');
        expect(res.status).toBe(401);
    });

    it('returns 200 with admin cookie', async () => {
        const cookie = await adminCookie();
        const res = await request(app)
            .get('/api/bookings')
            .set('Cookie', cookie);
        expect(res.status).toBe(200);
    });
});

describe('POST /api/tours (admin protected)', () => {
    it('returns 401 without auth', async () => {
        const res = await request(app)
            .post('/api/tours')
            .send({ tours: [], testimonials: [] });
        expect(res.status).toBe(401);
    });

    it('accepts a valid tours payload with admin cookie', async () => {
        const cookie = await adminCookie();
        const res = await request(app)
            .post('/api/tours')
            .set('Cookie', cookie)
            .send({ tours: [], testimonials: [] });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

// ─────────────────────────────────────────────────
// Public customer booking endpoint
// ─────────────────────────────────────────────────
describe('POST /api/bookings/customer', () => {
    it('returns 201 and bookingId for a valid booking', async () => {
        const res = await request(app)
            .post('/api/bookings/customer')
            .send({
                tourId: 1,
                tourName: 'Pyramids Tour',
                customerName: 'Jane Doe',
                customerEmail: 'jane@example.com',
                customerPhone: '+1-555-1234',
                numberOfPeople: 2,
                bookingDate: '2025-10-01',
            });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.bookingId).toBeDefined();
    });

    it('returns 400 when required fields are missing', async () => {
        const res = await request(app)
            .post('/api/bookings/customer')
            .send({ tourName: 'Test' }); // missing customerName, customerEmail, tourId
        expect(res.status).toBe(400);
    });

    it('does NOT require admin auth', async () => {
        const res = await request(app)
            .post('/api/bookings/customer')
            .send({
                tourId: 2,
                customerName: 'John Smith',
                customerEmail: 'john@example.com',
            });
        expect(res.status).toBe(201);
    });
});

// ─────────────────────────────────────────────────
// CMS Proxy — path forwarding
// ─────────────────────────────────────────────────
// These tests verify that the root-mounted proxy preserves the full request
// path when forwarding to the CMS.  A lightweight HTTP server plays the role
// of the CMS (target); we assert that the path it receives matches exactly
// what the browser sent.  If the proxy were mounted at a subpath
// (app.use('/admin', proxy)) Express would strip the prefix and the CMS
// would receive '/' instead of '/admin', causing an infinite redirect loop.
describe('CMS proxy — path preservation', () => {
    const http = require('http');
    const CMS_PATHS = ['/admin', '/_next', '/api/media', '/media'];

    const cases = [
        ['/admin',                '/admin'],
        ['/admin/',               '/admin/'],
        ['/admin/login',          '/admin/login'],
        ['/admin/collections/foo','/admin/collections/foo'],
        ['/_next/static/js/a.js', '/_next/static/js/a.js'],
        ['/api/media/123',        '/api/media/123'],
        ['/media/photo.jpg',      '/media/photo.jpg'],
    ];

    test.each(cases)(
        'GET %s is forwarded to CMS as %s',
        async (requestPath, expectedCmsPath) => {
            // Use a small isolated Express app with a fresh proxy target so
            // each case can assert the exact path received by the CMS stub.
            const express2 = require('express');
            const { createProxyMiddleware: cpm } = require('http-proxy-middleware');
            const mini = express2();
            const proxiedPaths = [];
            const miniCms = http.createServer((req, res) => {
                proxiedPaths.push(req.url.split('?')[0]);
                res.writeHead(200);
                res.end('ok');
            });
            await new Promise((r) => miniCms.listen(0, '127.0.0.1', r));
            const miniPort = miniCms.address().port;

            mini.use(cpm({
                target: `http://127.0.0.1:${miniPort}`,
                changeOrigin: true,
                pathFilter: (p) => CMS_PATHS.some((prefix) => p === prefix || p.startsWith(prefix + '/')),
                on: { error: (_e, _r, res2) => { res2.status(502).end(); } },
            }));
            const miniServer = http.createServer(mini);
            await new Promise((r) => miniServer.listen(0, '127.0.0.1', r));
            const miniMainPort = miniServer.address().port;

            await new Promise((resolve, reject) => {
                http.get(`http://127.0.0.1:${miniMainPort}${requestPath}`, (res2) => {
                    res2.resume(); res2.on('end', resolve);
                }).on('error', reject);
            });

            await new Promise((r) => miniServer.close(r));
            await new Promise((r) => miniCms.close(r));

            expect(proxiedPaths).toHaveLength(1);
            expect(proxiedPaths[0]).toBe(expectedCmsPath);
        }
    );

    it('does NOT proxy non-CMS paths (e.g. /api/tours)', async () => {
        const express2 = require('express');
        const { createProxyMiddleware: cpm } = require('http-proxy-middleware');
        const proxiedPaths = [];
        const miniCms = http.createServer((req, res) => {
            proxiedPaths.push(req.url);
            res.writeHead(200);
            res.end('ok');
        });
        await new Promise((r) => miniCms.listen(0, '127.0.0.1', r));
        const miniPort = miniCms.address().port;

        const mini = express2();
        mini.use(cpm({
            target: `http://127.0.0.1:${miniPort}`,
            changeOrigin: true,
            pathFilter: (p) => CMS_PATHS.some((prefix) => p === prefix || p.startsWith(prefix + '/')),
            on: { error: (_e, _r, res2) => { res2.status(502).end(); } },
        }));
        mini.get('/api/tours', (_req, res2) => res2.json({ tours: [] }));
        const miniServer = http.createServer(mini);
        await new Promise((r) => miniServer.listen(0, '127.0.0.1', r));
        const miniMainPort = miniServer.address().port;

        await new Promise((resolve, reject) => {
            http.get(`http://127.0.0.1:${miniMainPort}/api/tours`, (res2) => {
                res2.resume(); res2.on('end', resolve);
            }).on('error', reject);
        });

        await new Promise((r) => miniServer.close(r));
        await new Promise((r) => miniCms.close(r));

        expect(proxiedPaths).toHaveLength(0);
    });
});

// Cleanup temp dir after all tests.
afterAll(() => {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
});
