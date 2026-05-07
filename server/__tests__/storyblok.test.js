const {
  extractStoryblokPayload,
  getStoryblokVersion,
  normalizeStoryblokPayload,
  updateStoryblokResource,
} = require('../storyblok');

describe('Storyblok helpers', () => {
  it('parses JSON textarea payloads', () => {
    const payload = extractStoryblokPayload({
      content: {
        component: 'json_document',
        json: '{"blogs":[{"title":"Test"}]}',
      },
    });

    expect(payload).toEqual({ blogs: [{ title: 'Test' }] });
  });

  it('strips Storyblok meta fields from direct content objects', () => {
    const payload = extractStoryblokPayload({
      content: {
        component: 'settings_document',
        hero: { title: 'Explore Egypt' },
        _uid: 'abc123',
      },
    });

    expect(payload).toEqual({ hero: { title: 'Explore Egypt' } });
  });

  it('throws when a Storyblok JSON field is invalid', () => {
    expect(() =>
      extractStoryblokPayload({
        slug: 'cms-blogs',
        content: {
          component: 'json_document',
          json: '{"blogs": }',
        },
      })
    ).toThrow(/Invalid Storyblok JSON/);
  });

  it('detects draft mode from preview cookies and query params', () => {
    expect(getStoryblokVersion({ query: { _storyblok: '1' } })).toBe('draft');
    expect(getStoryblokVersion({ cookies: { storyblokPreview: 'draft' } })).toBe('draft');
    expect(getStoryblokVersion({ query: {} })).toBe('published');
  });

  it('normalizes resource payload wrappers', () => {
    expect(normalizeStoryblokPayload('blogs', [{ title: 'Hello' }])).toEqual({
      blogs: [{ title: 'Hello' }],
    });
    expect(normalizeStoryblokPayload('tours', { tours: [], testimonials: [] })).toEqual({
      tours: [],
      testimonials: [],
    });
  });

  it('returns null for empty Storyblok content so callers can fall back', () => {
    expect(
      extractStoryblokPayload({
        slug: 'cms-settings',
        content: {
          component: 'json_document',
          json: '',
        },
      })
    ).toBeNull();
  });

  it('updates stories through the management API without requiring a delivery token', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stories: [
            {
              id: 42,
              name: 'blogs',
              slug: 'cms-blogs',
              is_startpage: false,
              content: { component: 'json_document' },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    try {
      await expect(
        updateStoryblokResource(
          'blogs',
          { blogs: [{ title: 'Updated' }] },
          {
            STORYBLOK_MANAGEMENT_TOKEN: 'management-token',
            STORYBLOK_SPACE_ID: 'space-id',
          }
        )
      ).resolves.toEqual({ persisted: true });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch.mock.calls[0][0]).toContain('/stories?by_slugs=cms-blogs');
      expect(global.fetch.mock.calls[1][0]).toContain('/stories/42');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
