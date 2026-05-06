const path = require('path');
const http = require('http');
const net = require('net');
const fs = require('fs');

const {
  buildRuntimeEnv,
  waitForCms,
  validateRuntimeEnv,
  getStartupRetryDelayMs,
  isPortInUse,
  checkCmsPrerequisites,
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

  it('rejects immediately when isProcessAlive returns false', async () => {
    await expect(
      waitForCms('http://127.0.0.1:19999', {
        pollIntervalMs: 100,
        timeoutMs: 5000,
        isProcessAlive: () => false,
      })
    ).rejects.toThrow(/CMS process exited before becoming ready/);
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

describe('isPortInUse', () => {
  it('resolves true when a server is listening on the port', async () => {
    const server = net.createServer();
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();

    try {
      await expect(isPortInUse(port)).resolves.toBe(true);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('resolves false when nothing is listening on the port', async () => {
    // Pick a port that is almost certainly free by binding then immediately closing
    const server = net.createServer();
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    await new Promise((resolve) => server.close(resolve));

    await expect(isPortInUse(port)).resolves.toBe(false);
  });

  it('resolves false for an out-of-range port number', async () => {
    await expect(isPortInUse(99999)).resolves.toBe(false);
    await expect(isPortInUse(-1)).resolves.toBe(false);
  });

  it('resolves false for a non-numeric port value', async () => {
    await expect(isPortInUse('abc')).resolves.toBe(false);
  });
});

describe('checkCmsPrerequisites', () => {
  // checkCmsPrerequisites reads CMS_DIR which is hard-wired to the real cms/
  // directory.  We verify the two failure cases by temporarily renaming the
  // directories so the check sees them as absent.

  it('throws when cms/node_modules is missing', () => {
    // Monkey-patch fs.existsSync to simulate missing node_modules
    const realExistsSync = fs.existsSync;
    jest.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (p.endsWith('node_modules')) return false;
      return realExistsSync(p);
    });
    try {
      expect(() => checkCmsPrerequisites()).toThrow(/npm install --prefix cms/);
    } finally {
      jest.restoreAllMocks();
    }
  });

  it('throws when cms/.next build directory is missing', () => {
    const realExistsSync = fs.existsSync;
    jest.spyOn(fs, 'existsSync').mockImplementation((p) => {
      if (p.endsWith('node_modules')) return true;
      if (p.endsWith('.next')) return false;
      return realExistsSync(p);
    });
    try {
      expect(() => checkCmsPrerequisites()).toThrow(/npm run build --prefix cms/);
    } finally {
      jest.restoreAllMocks();
    }
  });
});
