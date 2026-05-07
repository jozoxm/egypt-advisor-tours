const {
  extractStoryblokPayload,
  getStoryblokVersion,
  normalizeStoryblokPayload,
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
});
