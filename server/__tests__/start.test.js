const path = require('path');
const http = require('http');

const { buildRuntimeEnv, waitForCms, validateRuntimeEnv } = require('../../start');

describe('production startup environment', () => {
  it('applies Hostinger-friendly defaults for both Express and CMS', () => {
    const env = buildRuntimeEnv({});

    expect(env.PORT).toBe('5000');
    expect(env.CMS_PORT).toBe('3001');
    expect(env.CMS_PM2_NAME).toBe('egypt-cms');
    expect(env.CMS_URL).toBe('http://localhost:3001');
    expect(env.PAYLOAD_SERVER_URL).toBe('http://localhost:5000');
    expect(env.CMS_READY_TIMEOUT_MS).toBe('120000');
    expect(env.DATABASE_PATH).toBe(
      path.join(path.resolve(__dirname, '..', '..'), 'data', 'payload.db')
    );
  });

  it('preserves explicitly provided production values', () => {
    const env = buildRuntimeEnv({
      PORT: '8080',
      CMS_PORT: '3010',
      CMS_PM2_NAME: 'custom-cms',
      CMS_URL: 'http://127.0.0.1:3010',
      PAYLOAD_SERVER_URL: 'https://egyptadvisortours.com',
      DATABASE_PATH: '/home/u123/admin_data/payload.db',
      CMS_READY_TIMEOUT_MS: '60000',
    });

    expect(env.PORT).toBe('8080');
    expect(env.CMS_PORT).toBe('3010');
    expect(env.CMS_PM2_NAME).toBe('custom-cms');
    expect(env.CMS_URL).toBe('http://127.0.0.1:3010');
    expect(env.PAYLOAD_SERVER_URL).toBe('https://egyptadvisortours.com');
    expect(env.DATABASE_PATH).toBe('/home/u123/admin_data/payload.db');
    expect(env.CMS_READY_TIMEOUT_MS).toBe('60000');
  });
});

describe('validateRuntimeEnv', () => {
  it('accepts required production variables when valid', () => {
    expect(() =>
      validateRuntimeEnv({
        PAYLOAD_SECRET: 'secret',
        DATABASE_PATH: '/home/test/payload.db',
        CMS_URL: 'http://localhost:3001',
      })
    ).not.toThrow();
  });

  it('throws when required variables are missing', () => {
    expect(() =>
      validateRuntimeEnv({
        PAYLOAD_SECRET: '',
        DATABASE_PATH: '/home/test/payload.db',
        CMS_URL: '',
      })
    ).toThrow(/Missing required environment variable/);
  });

  it('throws when DATABASE_PATH is not absolute', () => {
    expect(() =>
      validateRuntimeEnv({
        PAYLOAD_SECRET: 'secret',
        DATABASE_PATH: 'relative/payload.db',
        CMS_URL: 'http://localhost:3001',
      })
    ).toThrow(/DATABASE_PATH must be an absolute path/);
  });

  it('throws when CMS_URL is invalid', () => {
    expect(() =>
      validateRuntimeEnv({
        PAYLOAD_SECRET: 'secret',
        DATABASE_PATH: '/home/test/payload.db',
        CMS_URL: 'localhost:3001',
      })
    ).toThrow(/CMS_URL is invalid/);
  });
});

describe('waitForCms', () => {
  it('resolves when the CMS URL responds with any HTTP status', async () => {
    const server = http.createServer((req, res) => {
      res.writeHead(200);
      res.end();
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();

    try {
      await waitForCms(`http://127.0.0.1:${port}`, { pollIntervalMs: 100, timeoutMs: 5000 });
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('rejects when the CMS URL is unreachable within the timeout', async () => {
    await expect(
      waitForCms('http://127.0.0.1:19999', { pollIntervalMs: 100, timeoutMs: 400 })
    ).rejects.toThrow(/did not become ready/);
  });
});
