const { buildRuntimeEnv, validateRuntimeEnv } = require('../../start');

describe('production startup environment', () => {
  it('applies Storyblok-friendly defaults for Express startup', () => {
    const env = buildRuntimeEnv({});

    expect(env.PORT).toBe('5000');
    expect(env.STORYBLOK_REGION).toBe('eu');
    expect(env.STORYBLOK_EDITOR_URL).toBe('https://app.storyblok.com/');
  });

  it('derives the Storyblok editor URL from the configured space id', () => {
    const env = buildRuntimeEnv({
      STORYBLOK_SPACE_ID: '123456',
    });

    expect(env.STORYBLOK_EDITOR_URL).toBe(
      'https://app.storyblok.com/#/me/spaces/123456/content/'
    );
  });

  it('preserves explicitly provided runtime values', () => {
    const env = buildRuntimeEnv({
      PORT: '8080',
      STORYBLOK_REGION: 'us',
      STORYBLOK_EDITOR_URL: 'https://app.storyblok.com/#/me/spaces/999/content/',
    });

    expect(env.PORT).toBe('8080');
    expect(env.STORYBLOK_REGION).toBe('us');
    expect(env.STORYBLOK_EDITOR_URL).toBe(
      'https://app.storyblok.com/#/me/spaces/999/content/'
    );
  });
});

describe('validateRuntimeEnv', () => {
  it('requires STORYBLOK_PREVIEW_TOKEN in production', () => {
    expect(() =>
      validateRuntimeEnv({
        NODE_ENV: 'production',
        STORYBLOK_EDITOR_URL: 'https://app.storyblok.com/',
      })
    ).toThrow(/STORYBLOK_PREVIEW_TOKEN is required in production/);
  });

  it('throws a clear error when STORYBLOK_EDITOR_URL is invalid', () => {
    expect(() =>
      validateRuntimeEnv({
        STORYBLOK_PREVIEW_TOKEN: 'token',
        STORYBLOK_EDITOR_URL: 'app.storyblok.com',
      })
    ).toThrow(/STORYBLOK_EDITOR_URL is invalid/);
  });

  it('accepts a valid Storyblok runtime configuration', () => {
    expect(() =>
      validateRuntimeEnv({
        NODE_ENV: 'production',
        STORYBLOK_PREVIEW_TOKEN: 'token',
        STORYBLOK_EDITOR_URL: 'https://app.storyblok.com/',
      })
    ).not.toThrow();
  });
});
