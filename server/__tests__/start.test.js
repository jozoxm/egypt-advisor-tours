const path = require('path');
const http = require('http');

const {
  buildRuntimeEnv,
  waitForCms,
  validateRuntimeEnv,
  getStartupRetryDelayMs,
} = require('../../start');

describe('production startup environment', () => {
  it('applies Hostinger-friendly defaults for both Express and CMS', () => {
    const env = buildRuntimeEnv({});

    expect(env.PORT).toBe('5000');
    expect(env.CMS_PORT).toBe('3001');
    expect(env.CMS_PM2_NAME).toBe('egypt-cms');
    expect(env.CMS_URL).toBe('http://localhost:3001');
    expect(env.PAYLOAD_SERVER_URL).toBe('http://localhost:5000');
    expect(env.CMS_READY_TIMEOUT_MS).toBe('180000');
    expect(env.CMS_MAX_STARTUP_ATTEMPTS).toBe('3');
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
      CMS_MAX_STARTUP_ATTEMPTS: '3',
    });

    expect(env.PORT).toBe('8080');
    expect(env.CMS_PORT).toBe('3010');
    expect(env.CMS_PM2_NAME).toBe('custom-cms');
    expect(env.CMS_URL).toBe('http://127.0.0.1:3010');
    expect(env.PAYLOAD_SERVER_URL).toBe('https://egyptadvisortours.com');
    expect(env.DATABASE_PATH).toBe('/home/u123/admin_data/payload.db');
    expect(env.CMS_READY_TIMEOUT_MS).toBe('60000');
    expect(env.CMS_MAX_STARTUP_ATTEMPTS).toBe('3');
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

describe('validateRuntimeEnv', () => {
  it('throws a clear error when CMS_URL is invalid', () => {
    expect(() =>
      validateRuntimeEnv({
        DATABASE_PATH: '/tmp/payload.db',
        CMS_URL: 'localhost:3001',
      })
    ).toThrow(/CMS_URL is invalid/);
  });

  it('accepts a valid CMS_URL with protocol', () => {
    expect(() =>
      validateRuntimeEnv({
        DATABASE_PATH: '/tmp/payload.db',
        CMS_URL: 'http://127.0.0.1:3001',
      })
    ).not.toThrow();
  });
});

describe('getStartupRetryDelayMs', () => {
  it('uses incremental backoff per startup attempt', () => {
    expect(getStartupRetryDelayMs(1)).toBe(5000);
    expect(getStartupRetryDelayMs(2)).toBe(10000);
    expect(getStartupRetryDelayMs(3)).toBe(15000);
  });
});
