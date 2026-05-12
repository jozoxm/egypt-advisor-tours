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
});
