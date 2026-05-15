describe('WordPress namespace and fallback behavior', () => {
  const ORIGINAL_ENV = process.env;
  let originalFetch;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    originalFetch = global.fetch;
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    global.fetch = originalFetch;
  });

  function ok(payload) {
    return {
      ok: true,
      json: async () => payload,
    };
  }

  function notFound() {
    return {
      ok: false,
      status: 404,
      json: async () => ({}),
    };
  }

  it('uses ramacf/v1 as the default namespace when WORDPRESS_API_NAMESPACE is not set', async () => {
    process.env.WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch.mockResolvedValueOnce(ok({ tours: [] }));

    await fetchWordpressResource('tours');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://cms.egyptadvisortours.com/wp-json/ramacf/v1/tours',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
      })
    );
  });

  it('keeps wp/v2 pages then posts fallbacks in the same read order', async () => {
    process.env.WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch
      .mockResolvedValueOnce(notFound())
      .mockResolvedValueOnce(notFound())
      .mockResolvedValueOnce(notFound())
      .mockResolvedValueOnce(ok([{ acf: { tours: [{ id: 1 }] } }]));

    const result = await fetchWordpressResource('tours');

    expect(result).toEqual({ tours: [{ id: 1 }], testimonials: [] });
    expect(global.fetch.mock.calls.map(([url]) => url)).toEqual([
      'https://cms.egyptadvisortours.com/wp-json/ramacf/v1/tours',
      'https://cms.egyptadvisortours.com/wp-json/ramacf/v1/content/tours',
      'https://cms.egyptadvisortours.com/wp-json/wp/v2/pages?slug=cms-tours&_fields=acf,content',
      'https://cms.egyptadvisortours.com/wp-json/wp/v2/posts?slug=cms-tours&_fields=acf,content',
    ]);
  });

  it('parses structured acf tours and testimonials sibling fields', async () => {
    process.env.WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch
      .mockResolvedValueOnce(notFound())
      .mockResolvedValueOnce(notFound())
      .mockResolvedValueOnce(
        ok([
          {
            acf: {
              tours: { tours: [{ id: 1 }] },
              testimonials: { testimonials: [{ id: 'a' }] },
            },
          },
        ])
      );

    const result = await fetchWordpressResource('tours');

    expect(result).toEqual({
      tours: [{ id: 1 }],
      testimonials: [{ id: 'a' }],
    });
  });

  it('keeps acf payload fallback behavior for tours resource', async () => {
    process.env.WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch.mockResolvedValueOnce(
      ok([
        {
          acf: {
            payload: {
              tours: [{ id: 2 }],
              testimonials: [{ id: 'payload' }],
            },
          },
          content: {
            rendered: JSON.stringify({ tours: [{ id: 999 }], testimonials: [{ id: 'content' }] }),
          },
        },
      ])
    );

    const result = await fetchWordpressResource('tours');

    expect(result).toEqual({
      tours: [{ id: 2 }],
      testimonials: [{ id: 'payload' }],
    });
  });

  it('parses contact data from stringified acf.payload and keeps payload precedence', async () => {
    process.env.WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch.mockResolvedValueOnce(
      ok([
        {
          acf: {
            payload: JSON.stringify({ email: 'payload@example.com' }),
            data: JSON.stringify({ email: 'data@example.com' }),
          },
        },
      ])
    );

    const result = await fetchWordpressResource('contact');

    expect(result).toEqual({ email: 'payload@example.com' });
  });

  it('parses contact data from stringified acf.data when payload is not usable', async () => {
    process.env.WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch.mockResolvedValueOnce(
      ok([
        {
          acf: {
            payload: 'not-json',
            data: JSON.stringify({ phone: '+20-12345' }),
          },
        },
      ])
    );

    const result = await fetchWordpressResource('contact');

    expect(result).toEqual({ phone: '+20-12345' });
  });
});
