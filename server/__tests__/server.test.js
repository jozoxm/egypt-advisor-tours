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
process.env.STORYBLOK_EDITOR_URL = 'https://app.storyblok.com/#/me/spaces/123/content/';
process.env.STORYBLOK_PREVIEW_SECRET = 'storyblok-secret';

// Load the app AFTER setting env vars.
const app = require('../index.js');
const jwt = require('jsonwebtoken');

// Helper: obtain a valid admin session + CSRF token.
async function adminSession() {
    const res = await request(app)
        .post('/api/admin/login')
        .send({ username: 'testadmin', password: 'test-password' });
    const cookies = res.headers['set-cookie'] || [];
    const csrfCookie = cookies.find((cookie) => cookie.startsWith('adminCsrfToken='));
    const csrfToken = csrfCookie ? csrfCookie.split(';')[0].split('=')[1] : '';
    return { cookies, csrfToken };
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
    it('returns 503 with degraded status when Storyblok is not configured', async () => {
        const res = await request(app).get('/api/admin/health');
        expect(res.status).toBe(503);
        expect(res.body.status).toBe('degraded');
        expect(res.body.cms).toBe('down');
    });

    it('includes diagnostic details in non-production mode', async () => {
        const res = await request(app).get('/api/admin/health');
        // NODE_ENV is 'test' so diagnostics should be included
        expect(res.body).toHaveProperty('errorCode', 'STORYBLOK_NOT_CONFIGURED');
        expect(res.body).toHaveProperty('hint');
    });
});

describe('GET /admin', () => {
    it('redirects unauthenticated users to /admin/login', async () => {
        const res = await request(app).get('/admin');
        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/admin/login');
    });

    it('serves the Storyblok launcher admin shell for authenticated users', async () => {
        const session = await adminSession();
        const res = await request(app)
            .get('/admin')
            .set('Cookie', session.cookies);

        expect(res.status).toBe(200);
        expect(res.headers['content-security-policy']).toMatch(/frame-src https:\/\/app\.storyblok\.com/);
        expect(res.text).not.toContain('<iframe');
        expect(res.text).toContain(process.env.STORYBLOK_EDITOR_URL);
        expect(res.text).toContain('Open Storyblok editor');
        expect(res.text).toContain('id="switch-account"');
        expect(res.text).toContain('/api/admin/logout');
        expect(res.text).toContain('/admin/login?force=1');
        expect(res.text).toContain("window.open(editorUrl, '_blank', 'noopener,noreferrer');");
    });

    it('includes the configured editor origin in admin CSP frame-src', async () => {
        const originalEditorUrl = process.env.STORYBLOK_EDITOR_URL;
        process.env.STORYBLOK_EDITOR_URL = 'https://custom-editor.example.com/editor';
        const session = await adminSession();

        try {
            const res = await request(app)
                .get('/admin')
                .set('Cookie', session.cookies);

            expect(res.status).toBe(200);
            expect(res.headers['content-security-policy']).toMatch(/frame-src[^;]*https:\/\/custom-editor\.example\.com/);
        } finally {
            process.env.STORYBLOK_EDITOR_URL = originalEditorUrl;
        }
    });
});

describe('GET /admin/login', () => {
    it('renders a login form', async () => {
        const res = await request(app).get('/admin/login');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Admin login');
        expect(res.text).toContain('Sign in');
    });

    it('redirects authenticated users to /admin', async () => {
        const session = await adminSession();
        const res = await request(app)
            .get('/admin/login')
            .set('Cookie', session.cookies);

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/admin');
    });

    it('renders login page when force=1 even if authenticated', async () => {
        const session = await adminSession();
        const res = await request(app)
            .get('/admin/login?force=1')
            .set('Cookie', session.cookies);

        expect(res.status).toBe(200);
        expect(res.text).toContain('Admin login');
    });
});

describe('Storyblok preview routes', () => {
    it('sets the preview cookie and redirects when the secret is valid', async () => {
        const res = await request(app)
            .get('/api/admin/preview/storyblok-secret');

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/');
        expect((res.headers['set-cookie'] || []).join(';')).toMatch(/storyblokPreview=draft/);
    });

    it('rejects invalid preview secrets', async () => {
        const res = await request(app)
            .get('/api/admin/preview/wrong-secret');

        expect(res.status).toBe(401);
    });

    it('requires a configured preview secret in production', async () => {
        const originalNodeEnv = process.env.NODE_ENV;
        const originalPreviewSecret = process.env.STORYBLOK_PREVIEW_SECRET;
        process.env.NODE_ENV = 'production';
        delete process.env.STORYBLOK_PREVIEW_SECRET;

        try {
            const res = await request(app).get('/api/admin/preview/any-secret');
            expect(res.status).toBe(404);
        } finally {
            process.env.NODE_ENV = originalNodeEnv;
            process.env.STORYBLOK_PREVIEW_SECRET = originalPreviewSecret;
        }
    });

    it('clears the preview cookie', async () => {
        const res = await request(app).post('/api/admin/preview/exit');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect((res.headers['set-cookie'] || []).join(';')).toMatch(/storyblokPreview=/);
    });

    it('returns preview status for authenticated admin', async () => {
        const session = await adminSession();
        const enableRes = await request(app)
            .post('/api/admin/preview/enable')
            .set('Cookie', session.cookies)
            .set('x-csrf-token', session.csrfToken);

        const statusCookies = [...session.cookies, ...(enableRes.headers['set-cookie'] || [])];
        const res = await request(app)
            .get('/api/admin/preview/status')
            .set('Cookie', statusCookies);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ active: true, mode: 'draft' });
    });

    it('enables preview mode for authenticated admin', async () => {
        const session = await adminSession();
        const res = await request(app)
            .post('/api/admin/preview/enable')
            .set('Cookie', session.cookies)
            .set('x-csrf-token', session.csrfToken);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect((res.headers['set-cookie'] || []).join(';')).toMatch(/storyblokPreview=draft/);
    });

    it('rejects unauthenticated preview enable requests', async () => {
        const res = await request(app).post('/api/admin/preview/enable');
        expect(res.status).toBe(401);
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
        expect((res.headers['set-cookie'] || []).join(';')).toMatch(/adminCsrfToken=/);
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
        const session = await adminSession();
        const res = await request(app)
            .get('/api/admin/verify')
            .set('Cookie', session.cookies);
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
        const session = await adminSession();
        const res = await request(app)
            .post('/api/admin/logout')
            .set('Cookie', session.cookies)
            .set('x-csrf-token', session.csrfToken);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        // The Set-Cookie header should clear the adminToken cookie
        const setCookie = (res.headers['set-cookie'] || []).join(';');
        expect(setCookie).toMatch(/adminToken=/);
    });

    it('clears cookies with the same secure attributes in production', async () => {
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        try {
            const session = await adminSession();
            const res = await request(app)
                .post('/api/admin/logout')
                .set('Cookie', session.cookies)
                .set('x-csrf-token', session.csrfToken);

            const setCookie = (res.headers['set-cookie'] || []).join(';');
            expect(setCookie).toMatch(/adminToken=/);
            expect(setCookie).toMatch(/adminCsrfToken=/);
            expect(setCookie).toMatch(/Secure/i);
            expect(setCookie).toMatch(/SameSite=Strict/i);
        } finally {
            process.env.NODE_ENV = originalNodeEnv;
        }
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
        const session = await adminSession();
        const res = await request(app)
            .get('/api/bookings')
            .set('Cookie', session.cookies);
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
        const session = await adminSession();
        const res = await request(app)
            .post('/api/tours')
            .set('Cookie', session.cookies)
            .set('x-csrf-token', session.csrfToken)
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

// Cleanup temp dir after all tests.
afterAll(() => {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
});
