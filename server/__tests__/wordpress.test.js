const {
    fetchTours,
    fetchBlogs,
    fetchPage,
    fetchSettings,
    fetchContact,
    fetchSlideshow,
    fetchGallery,
    fetchPromotions,
    fetchDestinations,
    fetchHomepage,
    isWordPressConfigured,
    clearCache,
    stripHtml,
    transformTour,
    transformBlog,
    transformSlide,
    transformPromotion,
    transformDestination,
} = require('../wordpress');

const originalFetch = global.fetch;

afterEach(() => {
    global.fetch = originalFetch;
    clearCache();
});

// ─────────────────────────────────────────────────
// stripHtml
// ─────────────────────────────────────────────────
describe('stripHtml', () => {
    it('removes HTML tags', () => {
        expect(stripHtml('<p>Hello</p>')).toBe('Hello');
    });

    it('decodes common HTML entities', () => {
        expect(stripHtml('Tom &amp; Jerry')).toBe('Tom & Jerry');
        expect(stripHtml('&lt;b&gt;bold&lt;/b&gt;')).toBe('<b>bold</b>');
        expect(stripHtml('&quot;quoted&quot;')).toBe('"quoted"');
        expect(stripHtml('it&#39;s fine')).toBe("it's fine");
    });

    it('handles nested HTML', () => {
        expect(stripHtml('<p>Visit <strong>the pyramids</strong></p>')).toBe('Visit the pyramids');
    });

    it('returns empty string for falsy input', () => {
        expect(stripHtml('')).toBe('');
        expect(stripHtml(null)).toBe('');
        expect(stripHtml(undefined)).toBe('');
    });

    it('trims whitespace', () => {
        expect(stripHtml('  <p> text </p>  ')).toBe('text');
    });
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
        // image should be emoji (ACF icon), not a URL
        expect(result.image).toBe('🏛️');
        // actual media URL should be in photoUrl
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
        // image should be default emoji (no ACF image set), not a URL string
        expect(result.image).toBe('🗺️');
        // actual media URL goes in photoUrl
        expect(result.photoUrl).toBe('https://example.com/blog.jpg');
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
// transformTour — safeIcon guard
// ─────────────────────────────────────────────────
describe('transformTour — image field URL guard', () => {
    it('uses fallback emoji when acf.image is a URL', () => {
        const post = {
            id: 1, slug: 'test', date: '',
            title: { rendered: 'Test' },
            content: { rendered: '' },
            excerpt: { rendered: '' },
            acf: { image: 'https://example.com/photo.jpg' },
            _embedded: {},
        };
        expect(transformTour(post).image).toBe('🏛️');
        expect(transformTour(post).photoUrl).toBe('');
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

// ─────────────────────────────────────────────────
// transformSlide
// ─────────────────────────────────────────────────
describe('transformSlide', () => {
    it('maps ACF fields to slide shape', () => {
        const post = {
            id: 100,
            slug: 'pyramids-slide',
            title: { rendered: 'Pyramids of Giza' },
            acf: {
                name: 'Pyramids of Giza',
                image: 'https://example.com/pyramids.jpg',
                gradient: 'linear-gradient(135deg, #8B6914, #D4AF37)',
            },
            _embedded: {},
        };
        const result = transformSlide(post);
        expect(result.id).toBe(100);
        expect(result.name).toBe('Pyramids of Giza');
        expect(result.image).toBe('https://example.com/pyramids.jpg');
        expect(result.gradient).toBe('linear-gradient(135deg, #8B6914, #D4AF37)');
        expect(result.slug).toBe('pyramids-slide');
    });

    it('falls back to WP title when ACF name is absent', () => {
        const post = {
            id: 101,
            slug: 'slide-no-acf',
            title: { rendered: 'WP Title' },
            acf: {},
            _embedded: {},
        };
        expect(transformSlide(post).name).toBe('WP Title');
    });
});

// ─────────────────────────────────────────────────
// transformPromotion
// ─────────────────────────────────────────────────
describe('transformPromotion', () => {
    it('maps ACF fields to promotion shape', () => {
        const post = {
            id: 200,
            slug: 'summer-deal',
            title: { rendered: 'Summer Deal' },
            excerpt: { rendered: '<p>Big savings</p>' },
            date: '2026-06-01T00:00:00',
            acf: {
                title: 'Summer Deal',
                description: 'Get 20% off all tours',
                discount: '20%',
                valid_until: '2026-08-31',
                active: true,
            },
            _embedded: {
                'wp:featuredmedia': [{ source_url: 'https://example.com/promo.jpg' }],
            },
        };
        const result = transformPromotion(post);
        expect(result.id).toBe(200);
        expect(result.title).toBe('Summer Deal');
        expect(result.description).toBe('Get 20% off all tours');
        expect(result.discount).toBe('20%');
        expect(result.validUntil).toBe('2026-08-31');
        expect(result.active).toBe(true);
        // image stays as emoji, photoUrl gets the media URL
        expect(result.image).toBe('🎫');
        expect(result.photoUrl).toBe('https://example.com/promo.jpg');
    });

    it('strips HTML from excerpt when no ACF description', () => {
        const post = {
            id: 201,
            slug: 'promo-html',
            title: { rendered: 'HTML Promo' },
            excerpt: { rendered: '<p>Big savings</p>' },
            date: '',
            acf: {},
            _embedded: {},
        };
        expect(transformPromotion(post).description).toBe('Big savings');
    });
});

// ─────────────────────────────────────────────────
// transformDestination
// ─────────────────────────────────────────────────
describe('transformDestination', () => {
    it('maps ACF fields to destination shape', () => {
        const post = {
            id: 300,
            slug: 'cairo',
            title: { rendered: 'Cairo' },
            excerpt: { rendered: '<p>Capital city</p>' },
            date: '2026-01-01T00:00:00',
            acf: {
                name: 'Cairo',
                description: 'The vibrant capital',
                photo_url: 'https://example.com/cairo.jpg',
                featured: true,
            },
            _embedded: {},
        };
        const result = transformDestination(post);
        expect(result.id).toBe(300);
        expect(result.name).toBe('Cairo');
        expect(result.description).toBe('The vibrant capital');
        expect(result.photoUrl).toBe('https://example.com/cairo.jpg');
        expect(result.featured).toBe(true);
        // image defaults to emoji
        expect(result.image).toBe('🗺️');
    });
});

// ─────────────────────────────────────────────────
// fetchSlideshow
// ─────────────────────────────────────────────────
describe('fetchSlideshow', () => {
    it('returns slides array from ACF repeater on slideshow page', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    id: 50,
                    slug: 'slideshow',
                    acf: {
                        slides: [
                            { name: 'Pyramids', image: 'https://example.com/img.jpg', gradient: '' },
                        ],
                    },
                },
            ],
        });

        const result = await fetchSlideshow({ WORDPRESS_BASE_URL: 'https://cms.example.com' });
        expect(result).toHaveProperty('slides');
        expect(Array.isArray(result.slides)).toBe(true);
        expect(result.slides[0].name).toBe('Pyramids');
    });

    it('returns empty slides array when page has no ACF slides', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 51, slug: 'slideshow', acf: {} }],
        });

        const result = await fetchSlideshow({ WORDPRESS_BASE_URL: 'https://cms.example.com' });
        expect(result.slides).toEqual([]);
    });
});

// ─────────────────────────────────────────────────
// fetchGallery
// ─────────────────────────────────────────────────
describe('fetchGallery', () => {
    it('returns gallery array from ACF repeater on gallery page', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    id: 60,
                    slug: 'gallery',
                    acf: {
                        gallery: [{ image: 'https://example.com/g1.jpg', caption: 'Photo 1' }],
                    },
                },
            ],
        });

        const result = await fetchGallery({ WORDPRESS_BASE_URL: 'https://cms.example.com' });
        expect(result).toHaveProperty('gallery');
        expect(result.gallery[0].caption).toBe('Photo 1');
    });
});

// ─────────────────────────────────────────────────
// fetchPromotions
// ─────────────────────────────────────────────────
describe('fetchPromotions', () => {
    it('fetches and transforms WP promotion posts', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    id: 70,
                    slug: 'summer-deal',
                    title: { rendered: 'Summer Deal' },
                    excerpt: { rendered: '<p>20% off</p>' },
                    date: '2026-06-01T00:00:00',
                    acf: { discount: '20%', active: true },
                    _embedded: {},
                },
            ],
        });

        const result = await fetchPromotions({ WORDPRESS_BASE_URL: 'https://cms.example.com' });
        expect(result).toHaveProperty('promotions');
        expect(Array.isArray(result.promotions)).toBe(true);
        expect(result.promotions[0].discount).toBe('20%');
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/wp-json/wp/v2/promotion?per_page=100&_embed'),
            expect.any(Object)
        );
    });
});

// ─────────────────────────────────────────────────
// fetchDestinations
// ─────────────────────────────────────────────────
describe('fetchDestinations', () => {
    it('fetches and transforms WP destination posts', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    id: 80,
                    slug: 'cairo',
                    title: { rendered: 'Cairo' },
                    excerpt: { rendered: '' },
                    date: '2026-01-01T00:00:00',
                    acf: { name: 'Cairo', featured: true },
                    _embedded: {},
                },
            ],
        });

        const result = await fetchDestinations({ WORDPRESS_BASE_URL: 'https://cms.example.com' });
        expect(result).toHaveProperty('destinations');
        expect(result.destinations[0].name).toBe('Cairo');
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/wp-json/wp/v2/destination?per_page=100&_embed'),
            expect.any(Object)
        );
    });
});

// ─────────────────────────────────────────────────
// fetchHomepage
// ─────────────────────────────────────────────────
describe('fetchHomepage', () => {
    it('returns ACF fields from the home page', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    id: 90,
                    slug: 'home',
                    acf: { hero: { title: 'Welcome to Egypt' } },
                },
            ],
        });

        const result = await fetchHomepage({ WORDPRESS_BASE_URL: 'https://cms.example.com' });
        expect(result).toHaveProperty('hero');
        expect(result.hero.title).toBe('Welcome to Egypt');
    });

    it('returns null when the home page has no ACF fields', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 91, slug: 'home', acf: {} }],
        });

        const result = await fetchHomepage({ WORDPRESS_BASE_URL: 'https://cms.example.com' });
        expect(result).toBeNull();
    });
});
