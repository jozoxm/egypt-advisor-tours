const {
    fetchTours,
    fetchBlogs,
    fetchPage,
    fetchSettings,
    fetchContact,
    isWordPressConfigured,
    clearCache,
    transformTour,
    transformBlog,
} = require('../wordpress');

const originalFetch = global.fetch;

afterEach(() => {
    global.fetch = originalFetch;
    clearCache();
});

// ─────────────────────────────────────────────────
// isWordPressConfigured
// ─────────────────────────────────────────────────
describe('isWordPressConfigured', () => {
    it('returns false when WORDPRESS_BASE_URL is not set', () => {
        expect(isWordPressConfigured({})).toBe(false);
    });

    it('returns true when WORDPRESS_BASE_URL is set', () => {
        expect(isWordPressConfigured({ WORDPRESS_BASE_URL: 'https://cms.example.com' })).toBe(true);
    });
});

// ─────────────────────────────────────────────────
// transformTour
// ─────────────────────────────────────────────────
describe('transformTour', () => {
    it('maps WP post fields to tour shape', () => {
        const post = {
            id: 10,
            slug: 'pyramids-tour',
            date: '2025-01-01T00:00:00',
            title: { rendered: 'Pyramids Tour' },
            content: { rendered: '<p>Visit the pyramids</p>' },
            excerpt: { rendered: '<p>Short excerpt</p>' },
            acf: {
                name: 'Pyramids of Giza',
                duration: '4 hours',
                prices: { individual: '$225', group: '$175', sharing: '$99' },
                rating: 4.9,
                reviews: 324,
                group_size: '2-10 people',
                category: 'Historical',
            },
            _embedded: {
                'wp:featuredmedia': [{ source_url: 'https://example.com/img.jpg' }],
                'wp:term': [[{ id: 1, name: 'Historical', taxonomy: 'category' }]],
            },
        };

        const result = transformTour(post);

        expect(result.id).toBe(10);
        expect(result.name).toBe('Pyramids of Giza');
        expect(result.duration).toBe('4 hours');
        expect(result.prices).toEqual({ individual: '$225', group: '$175', sharing: '$99' });
        expect(result.rating).toBe(4.9);
        expect(result.reviews).toBe(324);
        expect(result.groupSize).toBe('2-10 people');
        expect(result.category).toBe('Historical');
        expect(result.photoUrl).toBe('https://example.com/img.jpg');
        expect(result.slug).toBe('pyramids-tour');
    });

    it('falls back to WP title when ACF name is absent', () => {
        const post = {
            id: 1,
            slug: 'test-tour',
            date: '',
            title: { rendered: 'Fallback Title' },
            content: { rendered: '' },
            excerpt: { rendered: '' },
            acf: {},
            _embedded: {},
        };
        const result = transformTour(post);
        expect(result.name).toBe('Fallback Title');
    });

    it('uses default emoji when no featured media is present', () => {
        const post = {
            id: 2,
            slug: 'no-image',
            date: '',
            title: { rendered: 'No Image Tour' },
            content: { rendered: '' },
            excerpt: { rendered: '' },
            acf: {},
            _embedded: {},
        };
        const result = transformTour(post);
        expect(result.image).toBe('🏛️');
    });
});

// ─────────────────────────────────────────────────
// transformBlog
// ─────────────────────────────────────────────────
describe('transformBlog', () => {
    it('maps WP post fields to blog shape', () => {
        const post = {
            id: 5,
            slug: 'top-10-gems',
            date: '2026-02-15T00:00:00',
            title: { rendered: 'Top 10 Gems' },
            content: { rendered: '<p>Full content here</p>' },
            excerpt: { rendered: '<p>Short excerpt</p>' },
            acf: {
                author: 'Egypt Advisor Team',
                category: 'Travel Tips',
                featured: true,
            },
            _embedded: {
                'wp:featuredmedia': [{ source_url: 'https://example.com/blog.jpg' }],
                author: [{ name: 'WP Author' }],
                'wp:term': [[{ id: 2, name: 'Travel Tips', taxonomy: 'category' }]],
            },
        };

        const result = transformBlog(post);

        expect(result.id).toBe(5);
        expect(result.title).toBe('Top 10 Gems');
        expect(result.author).toBe('Egypt Advisor Team');
        expect(result.category).toBe('Travel Tips');
        expect(result.featured).toBe(true);
        expect(result.image).toBe('https://example.com/blog.jpg');
        expect(result.slug).toBe('top-10-gems');
    });

    it('falls back to WP author name when ACF author is absent', () => {
        const post = {
            id: 6,
            slug: 'blog-fallback',
            date: '',
            title: { rendered: 'Test Blog' },
            content: { rendered: '' },
            excerpt: { rendered: '' },
            acf: {},
            _embedded: { author: [{ name: 'WP Author Name' }] },
        };
        const result = transformBlog(post);
        expect(result.author).toBe('WP Author Name');
    });

    it('uses default author when no author data is present', () => {
        const post = {
            id: 7,
            slug: 'blog-default-author',
            date: '',
            title: { rendered: 'Test Blog' },
            content: { rendered: '' },
            excerpt: { rendered: '' },
            acf: {},
            _embedded: {},
        };
        const result = transformBlog(post);
        expect(result.author).toBe('Egypt Advisor Team');
    });
});

// ─────────────────────────────────────────────────
// fetchTours
// ─────────────────────────────────────────────────
describe('fetchTours', () => {
    it('fetches and transforms WP tour posts', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    id: 1,
                    slug: 'pyramids',
                    date: '2025-01-01T00:00:00',
                    title: { rendered: 'Pyramids' },
                    content: { rendered: '' },
                    excerpt: { rendered: '' },
                    acf: { name: 'Pyramids Tour', duration: '4 hours' },
                    _embedded: {},
                },
            ],
        });

        const result = await fetchTours({ WORDPRESS_BASE_URL: 'https://cms.example.com' });

        expect(result).toHaveProperty('tours');
        expect(result).toHaveProperty('testimonials');
        expect(Array.isArray(result.tours)).toBe(true);
        expect(result.tours[0].name).toBe('Pyramids Tour');
        expect(Array.isArray(result.testimonials)).toBe(true);
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/wp-json/wp/v2/tour?per_page=100&_embed'),
            expect.any(Object)
        );
    });

    it('returns cached result on second call', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        await fetchTours({ WORDPRESS_BASE_URL: 'https://cms.example.com' });
        await fetchTours({ WORDPRESS_BASE_URL: 'https://cms.example.com' });

        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('returns empty tours array when WP returns empty list', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        const result = await fetchTours({ WORDPRESS_BASE_URL: 'https://cms.example.com' });
        expect(result.tours).toEqual([]);
    });

    it('throws when WP API returns non-ok status', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: false,
            status: 503,
        });

        await expect(
            fetchTours({ WORDPRESS_BASE_URL: 'https://cms.example.com' })
        ).rejects.toThrow('503');
    });
});

// ─────────────────────────────────────────────────
// fetchBlogs
// ─────────────────────────────────────────────────
describe('fetchBlogs', () => {
    it('fetches and transforms WP blog posts', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    id: 10,
                    slug: 'top-hidden-gems',
                    date: '2026-02-15T00:00:00',
                    title: { rendered: 'Top 10 Hidden Gems' },
                    content: { rendered: '<p>content</p>' },
                    excerpt: { rendered: '<p>excerpt</p>' },
                    acf: { category: 'Travel Tips' },
                    _embedded: {},
                },
            ],
        });

        const result = await fetchBlogs({ WORDPRESS_BASE_URL: 'https://cms.example.com' });

        expect(result).toHaveProperty('blogs');
        expect(Array.isArray(result.blogs)).toBe(true);
        expect(result.blogs[0].title).toBe('Top 10 Hidden Gems');
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/wp-json/wp/v2/posts?per_page=100&_embed'),
            expect.any(Object)
        );
    });
});

// ─────────────────────────────────────────────────
// fetchPage
// ─────────────────────────────────────────────────
describe('fetchPage', () => {
    it('returns the first page matching the slug', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 20, slug: 'site-settings', acf: { hero: { title: 'Discover Egypt' } } }],
        });

        const page = await fetchPage('site-settings', { WORDPRESS_BASE_URL: 'https://cms.example.com' });

        expect(page).not.toBeNull();
        expect(page.slug).toBe('site-settings');
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('slug=site-settings'),
            expect.any(Object)
        );
    });

    it('returns null when no pages match the slug', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        const page = await fetchPage('nonexistent', { WORDPRESS_BASE_URL: 'https://cms.example.com' });
        expect(page).toBeNull();
    });
});

// ─────────────────────────────────────────────────
// fetchSettings
// ─────────────────────────────────────────────────
describe('fetchSettings', () => {
    it('returns ACF fields from the site-settings page', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    id: 30,
                    slug: 'site-settings',
                    title: { rendered: 'Site Settings' },
                    acf: { hero: { title: 'Discover Egypt' }, stats: [] },
                },
            ],
        });

        const settings = await fetchSettings({ WORDPRESS_BASE_URL: 'https://cms.example.com' });

        expect(settings).toHaveProperty('hero');
        expect(settings.hero.title).toBe('Discover Egypt');
    });

    it('returns null when the page does not exist', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        const settings = await fetchSettings({ WORDPRESS_BASE_URL: 'https://cms.example.com' });
        expect(settings).toBeNull();
    });

    it('returns null when ACF fields are empty', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 31, slug: 'site-settings', acf: {} }],
        });

        const settings = await fetchSettings({ WORDPRESS_BASE_URL: 'https://cms.example.com' });
        expect(settings).toBeNull();
    });
});

// ─────────────────────────────────────────────────
// fetchContact
// ─────────────────────────────────────────────────
describe('fetchContact', () => {
    it('returns ACF fields from the contact page', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    id: 40,
                    slug: 'contact',
                    acf: {
                        companyName: 'Egypt Advisor Tours',
                        emailPrimary: 'info@egyptadvisortours.com',
                        phone: '+20 123 456 7890',
                    },
                },
            ],
        });

        const contact = await fetchContact({ WORDPRESS_BASE_URL: 'https://cms.example.com' });

        expect(contact).toHaveProperty('companyName', 'Egypt Advisor Tours');
        expect(contact).toHaveProperty('emailPrimary', 'info@egyptadvisortours.com');
    });

    it('returns null when the contact page does not exist', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        const contact = await fetchContact({ WORDPRESS_BASE_URL: 'https://cms.example.com' });
        expect(contact).toBeNull();
    });
});

// ─────────────────────────────────────────────────
// clearCache
// ─────────────────────────────────────────────────
describe('clearCache', () => {
    it('forces a fresh fetch after the cache is cleared', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => [],
        });

        await fetchBlogs({ WORDPRESS_BASE_URL: 'https://cms.example.com' });
        clearCache();
        await fetchBlogs({ WORDPRESS_BASE_URL: 'https://cms.example.com' });

        expect(global.fetch).toHaveBeenCalledTimes(2);
    });
});
