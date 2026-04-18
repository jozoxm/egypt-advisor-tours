const path = require('path');

const { buildRuntimeEnv } = require('../../start');

describe('production startup environment', () => {
  it('applies Hostinger-friendly defaults for both Express and CMS', () => {
    const env = buildRuntimeEnv({});

    expect(env.PORT).toBe('5000');
    expect(env.CMS_PORT).toBe('3001');
    expect(env.CMS_URL).toBe('http://localhost:3001');
    expect(env.PAYLOAD_SERVER_URL).toBe('http://localhost:5000');
    expect(env.DATABASE_PATH).toBe(
      path.join(path.resolve(__dirname, '..', '..'), 'data', 'payload.db')
    );
  });

  it('preserves explicitly provided production values', () => {
    const env = buildRuntimeEnv({
      PORT: '8080',
      CMS_PORT: '3010',
      CMS_URL: 'http://127.0.0.1:3010',
      PAYLOAD_SERVER_URL: 'https://egyptadvisortours.com',
      DATABASE_PATH: '/home/u123/admin_data/payload.db',
    });

    expect(env.PORT).toBe('8080');
    expect(env.CMS_PORT).toBe('3010');
    expect(env.CMS_URL).toBe('http://127.0.0.1:3010');
    expect(env.PAYLOAD_SERVER_URL).toBe('https://egyptadvisortours.com');
    expect(env.DATABASE_PATH).toBe('/home/u123/admin_data/payload.db');
  });
});
