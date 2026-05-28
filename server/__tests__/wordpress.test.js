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

  it('accepts WORDPRESS_URL as a base URL alias', async () => {
    delete process.env.WORDPRESS_BASE_URL;
    process.env.WORDPRESS_URL = 'https://cms.example.com';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch.mockResolvedValueOnce(ok({ tours: [] }));

    await fetchWordpressResource('tours');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://cms.example.com/wp-json/ramacf/v1/tours',
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

  it('uses custom WORDPRESS_FOOTER_SLUG for wp/v2 fallback', async () => {
    process.env.WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
    process.env.WORDPRESS_FOOTER_SLUG = 'custom-footer-slug';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch
      .mockResolvedValueOnce(notFound())
      .mockResolvedValueOnce(notFound())
      .mockResolvedValueOnce(ok([{ acf: { copyright: '© Egypt Advisor Tours' } }]));

    await fetchWordpressResource('footer');

    expect(global.fetch.mock.calls.map(([url]) => url)).toContain(
      'https://cms.egyptadvisortours.com/wp-json/wp/v2/pages?slug=custom-footer-slug&_fields=acf,content'
    );
  });

  it('uses configured slug fallback for footer without throwing', async () => {
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
              payload: JSON.stringify({ copyright: '© Egypt Advisor Tours' }),
            },
          },
        ])
      );

    const result = await fetchWordpressResource('footer');

    expect(result).toEqual({ copyright: '© Egypt Advisor Tours' });
    expect(global.fetch.mock.calls.map(([url]) => url)).toEqual([
      'https://cms.egyptadvisortours.com/wp-json/ramacf/v1/footer',
      'https://cms.egyptadvisortours.com/wp-json/ramacf/v1/content/footer',
      'https://cms.egyptadvisortours.com/wp-json/wp/v2/pages?slug=cms-footer&_fields=acf,content',
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

  it('uses parsed stringified acf.payload tours data directly when present', async () => {
    process.env.WORDPRESS_BASE_URL = 'https://cms.example.com';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch.mockResolvedValueOnce(
      ok([
        {
          acf: {
            payload: JSON.stringify({
              tours: [{ id: 22 }],
              testimonials: [{ id: 'acf-free-payload' }],
            }),
          },
        },
      ])
    );

    const result = await fetchWordpressResource('tours');

    expect(result).toEqual({
      tours: [{ id: 22 }],
      testimonials: [{ id: 'acf-free-payload' }],
    });
  });

  it('uses parsed acf.payload for tours when acf.tours is present but not usable', async () => {
    process.env.WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch.mockResolvedValueOnce(
      ok([
        {
          acf: {
            tours: 'legacy-string',
            payload: JSON.stringify({
              tours: [{ id: 3 }],
              testimonials: [{ id: 'payload-3' }],
            }),
          },
        },
      ])
    );

    const result = await fetchWordpressResource('tours');

    expect(result).toEqual({
      tours: [{ id: 3 }],
      testimonials: [{ id: 'payload-3' }],
    });
  });

  it('uses parsed top-level payload for tours object responses when payload.tours is not usable', async () => {
    process.env.WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch.mockResolvedValueOnce(
      ok({
        tours: 'legacy-string',
        payload: JSON.stringify({
          tours: [{ id: 4 }],
          testimonials: [{ id: 'payload-4' }],
        }),
      })
    );

    const result = await fetchWordpressResource('tours');

    expect(result).toEqual({
      tours: [{ id: 4 }],
      testimonials: [{ id: 'payload-4' }],
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

  it('parses navigation object from stringified acf.payload', async () => {
    process.env.WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch.mockResolvedValueOnce(
      ok([
        {
          acf: {
            payload: JSON.stringify({
              logoText: 'Egypt Advisor Tours',
              primaryLinks: [{ label: 'Home', href: '/', type: 'route' }],
            }),
          },
        },
      ])
    );

    const result = await fetchWordpressResource('navigation');

    expect(result).toEqual({
      logoText: 'Egypt Advisor Tours',
      primaryLinks: [{ label: 'Home', href: '/', type: 'route' }],
    });
  });

  it('normalizes faq object shape with categories wrapper', async () => {
    process.env.WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch.mockResolvedValueOnce(
      ok([
        {
          acf: {
            payload: JSON.stringify({
              pageTitle: 'Frequently Asked Questions',
              pageIntro: 'Find answers',
              categories: [{ title: 'Booking', items: [] }],
            }),
          },
        },
      ])
    );

    const result = await fetchWordpressResource('faq');

    expect(result).toEqual({
      pageTitle: 'Frequently Asked Questions',
      pageIntro: 'Find answers',
      categories: [{ title: 'Booking', items: [] }],
      contactCta: null,
    });
  });

  it('normalizes faq array payload to categories object', async () => {
    process.env.WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch.mockResolvedValueOnce(
      ok([
        {
          acf: {
            payload: JSON.stringify([
              { title: 'Booking', items: [{ question: 'Q?', answer: 'A' }] },
            ]),
          },
        },
      ])
    );

    const result = await fetchWordpressResource('faq');

    expect(result).toEqual({
      categories: [{ title: 'Booking', items: [{ question: 'Q?', answer: 'A' }] }],
    });
  });

  it('parses tailorTrip object from stringified acf.payload', async () => {
    process.env.WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
    delete process.env.WORDPRESS_API_NAMESPACE;

    const { fetchWordpressResource } = require('../wordpress');
    global.fetch.mockResolvedValueOnce(
      ok([
        {
          acf: {
            payload: JSON.stringify({
              hero: { title: 'Tailor Your Egypt Journey' },
              form: { submitLabel: 'Send My Request' },
            }),
          },
        },
      ])
    );

    const result = await fetchWordpressResource('tailorTrip');

    expect(result).toEqual({
      hero: { title: 'Tailor Your Egypt Journey' },
      form: { submitLabel: 'Send My Request' },
    });
  });

  it.each(['homepage', 'about', 'footer'])(
    'normalizes %s as object content',
    async (resourceKey) => {
      process.env.WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
      delete process.env.WORDPRESS_API_NAMESPACE;

      const { fetchWordpressResource } = require('../wordpress');
      global.fetch.mockResolvedValueOnce(
        ok([
          {
            acf: {
              payload: JSON.stringify({ sectionTitle: `${resourceKey} section` }),
            },
          },
        ])
      );

      const result = await fetchWordpressResource(resourceKey);

      expect(result).toEqual({ sectionTitle: `${resourceKey} section` });
    }
  );
});
