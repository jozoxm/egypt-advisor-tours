const { buildRuntimeEnv, validateRuntimeEnv } = require('../../start');

describe('production startup environment', () => {
  it('applies WordPress-friendly defaults for Express startup', () => {
    const env = buildRuntimeEnv({});

    expect(env.PORT).toBe('5000');
    expect(env.WORDPRESS_BASE_URL).toBe('https://cms.egyptadvisortours.com');
  });

  it('preserves an explicitly configured WORDPRESS_BASE_URL', () => {
    const env = buildRuntimeEnv({
      WORDPRESS_BASE_URL: 'https://cms.mysite.com',
    });

    expect(env.WORDPRESS_BASE_URL).toBe('https://cms.mysite.com');
  });

  it('preserves explicitly provided runtime values', () => {
    const env = buildRuntimeEnv({
      PORT: '8080',
      WORDPRESS_BASE_URL: 'https://cms.mysite.com',
    });

    expect(env.PORT).toBe('8080');
    expect(env.WORDPRESS_BASE_URL).toBe('https://cms.mysite.com');
  });

  it('does NOT inject a default WORDPRESS_BASE_URL when CMS_PROVIDER=filesystem', () => {
    const env = buildRuntimeEnv({ CMS_PROVIDER: 'filesystem' });
    expect(env.WORDPRESS_BASE_URL).toBeUndefined();
  });

  it('does NOT inject a default WORDPRESS_BASE_URL when CMS_PROVIDER=storyblok', () => {
    const env = buildRuntimeEnv({ CMS_PROVIDER: 'storyblok' });
    expect(env.WORDPRESS_BASE_URL).toBeUndefined();
  });

  it('still preserves an explicit WORDPRESS_BASE_URL even when CMS_PROVIDER=filesystem', () => {
    const env = buildRuntimeEnv({
      CMS_PROVIDER: 'filesystem',
      WORDPRESS_BASE_URL: 'https://cms.mysite.com',
    });
    expect(env.WORDPRESS_BASE_URL).toBe('https://cms.mysite.com');
  });
});

describe('validateRuntimeEnv', () => {
  it('does not throw when no WORDPRESS_BASE_URL is provided', () => {
    expect(() => validateRuntimeEnv({})).not.toThrow();
  });

  it('throws a clear error when WORDPRESS_BASE_URL is invalid', () => {
    expect(() =>
      validateRuntimeEnv({
        WORDPRESS_BASE_URL: 'not-a-url',
      })
    ).toThrow(/WORDPRESS_BASE_URL is invalid/);
  });

  it('accepts a valid WordPress base URL', () => {
    expect(() =>
      validateRuntimeEnv({
        WORDPRESS_BASE_URL: 'https://cms.egyptadvisortours.com',
      })
    ).not.toThrow();
  });

  it('does not require Storyblok tokens in production', () => {
    expect(() =>
      validateRuntimeEnv({
        NODE_ENV: 'production',
      })
    ).not.toThrow();
  });
});

