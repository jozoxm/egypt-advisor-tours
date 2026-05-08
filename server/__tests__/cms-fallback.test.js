const request = require('supertest');
const path = require('path');
const os = require('os');
const fs = require('fs');

describe('Storyblok fallback behavior', () => {
  let tmpDir;

  beforeEach(() => {
    jest.resetModules();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eat-cms-fallback-'));

    process.env.DATA_PATH = tmpDir;
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_SECRET = 'test-jwt-secret';
    process.env.ADMIN_PASSWORD = 'test-password';
    process.env.ADMIN_USERNAME = 'testadmin';
    process.env.CMS_PROVIDER = 'storyblok';
    process.env.STORYBLOK_PREVIEW_TOKEN = 'test-preview-token';
    process.env.STORYBLOK_EDITOR_URL = 'https://app.storyblok.com/#/me/spaces/123/content/';

    jest.doMock('../storyblok', () => {
      const actual = jest.requireActual('../storyblok');
      return {
        ...actual,
        fetchStoryblokResource: jest.fn(async () => {
          throw new Error('Storyblok unavailable');
        }),
      };
    });
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_error) {
      // Best-effort temp cleanup for isolated test dirs.
    }
    delete process.env.CMS_PROVIDER;
    delete process.env.STORYBLOK_PREVIEW_TOKEN;
    jest.dontMock('../storyblok');
  });

  it('falls back to filesystem data when Storyblok is configured but fetch fails', async () => {
    const app = require('../index.js');
    const res = await request(app).get('/api/blogs');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('blogs');
    expect(Array.isArray(res.body.blogs)).toBe(true);
  });

  it('keeps /admin embedded editor in Storyblok mode', async () => {
    const app = require('../index.js');
    const loginRes = await request(app)
      .post('/api/admin/login')
      .send({ username: 'testadmin', password: 'test-password' });

    const cookies = loginRes.headers['set-cookie'] || [];
    const res = await request(app).get('/admin').set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.text).toContain('<iframe');
    expect(res.text).toContain(process.env.STORYBLOK_EDITOR_URL);
    expect(res.headers['content-security-policy']).toMatch(/frame-src https:\/\/app\.storyblok\.com/);
  });

  it('returns degraded health when Storyblok is configured but unreachable', async () => {
    const app = require('../index.js');
    const res = await request(app).get('/api/admin/health');

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.cms).toBe('storyblok_unreachable');
    expect(res.body.fallback).toBe('filesystem');
  });

  it('uses forced filesystem mode even when Storyblok token exists', async () => {
    process.env.CMS_PROVIDER = 'filesystem';
    jest.resetModules();
    const app = require('../index.js');

    const loginRes = await request(app)
      .post('/api/admin/login')
      .send({ username: 'testadmin', password: 'test-password' });
    const cookies = loginRes.headers['set-cookie'] || [];

    const [healthRes, adminRes] = await Promise.all([
      request(app).get('/api/admin/health'),
      request(app).get('/admin').set('Cookie', cookies),
    ]);

    expect(healthRes.status).toBe(200);
    expect(healthRes.body.mode).toBe('forced_filesystem');
    expect(healthRes.body.provider).toBe('filesystem');

    expect(adminRes.status).toBe(200);
    expect(adminRes.text).toContain('Admin is running in filesystem mode');
    expect(adminRes.text).toContain('CMS_PROVIDER=filesystem');
    expect(adminRes.text).not.toContain('<iframe');
  });
});
