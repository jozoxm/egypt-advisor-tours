const { buildRuntimeEnv, validateRuntimeEnv } = require('../../start');

describe('production startup environment', () => {
  it('applies Storyblok-friendly defaults for Express startup', () => {
    const env = buildRuntimeEnv({});

    expect(env.PORT).toBe('5000');
    expect(env.CMS_PROVIDER).toBe('auto');
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

  it('applies WordPress defaults when CMS provider is wordpress', () => {
    const env = buildRuntimeEnv({
      CMS_PROVIDER: 'wordpress',
    });

    expect(env.CMS_PROVIDER).toBe('wordpress');
    expect(env.WORDPRESS_BASE_URL).toBe('https://cms.egyptadvisortours.com');
  });
  it('accepts legacy WordPress URL aliases and wp provider alias', () => {
    const envFromWordpressUrl = buildRuntimeEnv({
      CMS_PROVIDER: 'wp',
      WORDPRESS_URL: 'https://cms.example.com',
    });
    const envFromCmsUrl = buildRuntimeEnv({
      CMS_PROVIDER: 'auto',
      CMS_URL: 'https://cms.example.org',
    });

    expect(envFromWordpressUrl.CMS_PROVIDER).toBe('wordpress');
    expect(envFromWordpressUrl.WORDPRESS_BASE_URL).toBe('https://cms.example.com');
    expect(envFromCmsUrl.WORDPRESS_BASE_URL).toBe('https://cms.example.org');
  });
});

describe('validateRuntimeEnv', () => {
  it('requires STORYBLOK_PREVIEW_TOKEN in production', () => {
    expect(() =>
      validateRuntimeEnv({
        NODE_ENV: 'production',
        CMS_PROVIDER: 'storyblok',
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

  it('accepts wordpress provider in production without Storyblok token', () => {
    expect(() =>
      validateRuntimeEnv({
        NODE_ENV: 'production',
        CMS_PROVIDER: 'wordpress',
        WORDPRESS_BASE_URL: 'https://cms.egyptadvisortours.com',
      })
    ).not.toThrow();
  });
});
