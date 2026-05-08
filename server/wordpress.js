const cache = new Map();

function parsePositiveInt(value, fallback) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// TTL is a process-wide config; always reads from process.env so that
// getCached() and setCached() use the same TTL without needing an env argument.
function getCacheTtl() {
    return parsePositiveInt(process.env.WORDPRESS_CACHE_TTL_MS, 5 * 60 * 1000);
}

function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > getCacheTtl()) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

function setCached(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}

function clearCache() {
    cache.clear();
}

function isWordPressConfigured(env) {
    return Boolean((env || process.env).WORDPRESS_BASE_URL);
}

function getBaseUrl(env) {
    return (env || process.env).WORDPRESS_BASE_URL || 'https://cms.egyptadvisortours.com';
}

function getTimeout(env) {
    return parsePositiveInt((env || process.env).WORDPRESS_TIMEOUT_MS, 8000);
}

async function wpFetch(url, env) {
    const timeoutMs = getTimeout(env);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!response.ok) {
            throw new Error(`WordPress API responded with ${response.status} for ${url}`);
        }
        return response.json();
    } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
            throw Object.assign(
                new Error(`WordPress API request timed out: ${url}`),
                { code: 'ETIMEDOUT' }
            );
        }
        throw err;
    }
}

// Strip HTML tags and decode common entities so .rendered fields from WordPress
// are returned as plain text, not raw HTML strings.
function stripHtml(html) {
    if (!html) return '';
    return String(html)
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();
}

function transformTour(post) {
    const embedded = post._embedded || {};
    const featuredMedia = (embedded['wp:featuredmedia'] || [])[0];
    const acf = post.acf || {};
    const terms = (embedded['wp:term'] || []).flat();
    const categories = terms.filter((t) => t.taxonomy === 'category').map((t) => t.name);
    const mediaUrl = featuredMedia ? featuredMedia.source_url : '';

    return {
        id: post.id,
        name: acf.name || stripHtml(post.title && post.title.rendered) || '',
        description: acf.description || stripHtml(post.content && post.content.rendered) || '',
        excerpt: acf.excerpt || stripHtml(post.excerpt && post.excerpt.rendered) || '',
        duration: acf.duration || '',
        // image: prefer ACF icon/emoji; never put a URL here so the frontend
        // renders it as text. Store the actual URL in photoUrl instead.
        image: acf.image || '🏛️',
        photoUrl: acf.photoUrl || acf.photo_url || mediaUrl || '',
        prices: acf.prices || {},
        rating: acf.rating || 0,
        reviews: acf.reviews || 0,
        groupSize: acf.groupSize || acf.group_size || '',
        category: acf.category || categories[0] || '',
        itinerary: acf.itinerary || [],
        includes: acf.includes || [],
        excludes: acf.excludes || [],
        highlights: acf.highlights || [],
        featured: Boolean(acf.featured),
        slug: post.slug || '',
        date: post.date || '',
    };
}

function transformBlog(post) {
    const embedded = post._embedded || {};
    const featuredMedia = (embedded['wp:featuredmedia'] || [])[0];
    const authorEntry = (embedded['author'] || [])[0];
    const acf = post.acf || {};
    const terms = (embedded['wp:term'] || []).flat();
    const categories = terms.filter((t) => t.taxonomy === 'category').map((t) => t.name);
    const mediaUrl = featuredMedia ? featuredMedia.source_url : '';

    return {
        id: post.id,
        title: acf.title || stripHtml(post.title && post.title.rendered) || '',
        author: acf.author || (authorEntry && authorEntry.name) || 'Egypt Advisor Team',
        date: acf.date || post.date || '',
        excerpt: acf.excerpt || stripHtml(post.excerpt && post.excerpt.rendered) || '',
        content: acf.content || stripHtml(post.content && post.content.rendered) || '',
        // image: prefer ACF icon/emoji; URL goes in photoUrl so blog cards
        // show an icon rather than a raw URL string.
        image: acf.image || '🗺️',
        photoUrl: acf.photoUrl || acf.photo_url || mediaUrl || '',
        category: acf.category || categories[0] || '',
        featured: Boolean(acf.featured),
        slug: post.slug || '',
    };
}

function transformSlide(post) {
    const embedded = post._embedded || {};
    const featuredMedia = (embedded['wp:featuredmedia'] || [])[0];
    const acf = post.acf || {};
    const mediaUrl = featuredMedia ? featuredMedia.source_url : '';

    return {
        id: post.id,
        name: acf.name || stripHtml(post.title && post.title.rendered) || '',
        image: acf.image || mediaUrl || '',
        gradient: acf.gradient || '',
        slug: post.slug || '',
    };
}

function transformPromotion(post) {
    const embedded = post._embedded || {};
    const featuredMedia = (embedded['wp:featuredmedia'] || [])[0];
    const acf = post.acf || {};
    const mediaUrl = featuredMedia ? featuredMedia.source_url : '';

    return {
        id: post.id,
        title: acf.title || stripHtml(post.title && post.title.rendered) || '',
        description: acf.description || stripHtml(post.excerpt && post.excerpt.rendered) || '',
        discount: acf.discount || '',
        validUntil: acf.valid_until || acf.validUntil || '',
        // image: prefer ACF icon/emoji so it renders correctly in existing card components
        image: acf.image || '🎫',
        photoUrl: acf.photoUrl || acf.photo_url || mediaUrl || '',
        active: acf.active !== false,
        slug: post.slug || '',
        date: post.date || '',
    };
}

function transformDestination(post) {
    const embedded = post._embedded || {};
    const featuredMedia = (embedded['wp:featuredmedia'] || [])[0];
    const acf = post.acf || {};
    const mediaUrl = featuredMedia ? featuredMedia.source_url : '';

    return {
        id: post.id,
        name: acf.name || stripHtml(post.title && post.title.rendered) || '',
        description: acf.description || stripHtml(post.excerpt && post.excerpt.rendered) || '',
        // image: prefer ACF icon/emoji; put URL in photoUrl
        image: acf.image || '🗺️',
        photoUrl: acf.photoUrl || acf.photo_url || mediaUrl || '',
        featured: Boolean(acf.featured),
        slug: post.slug || '',
        date: post.date || '',
    };
}

async function fetchTours(env) {
    const cacheKey = 'tours';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const baseUrl = getBaseUrl(env);
    const posts = await wpFetch(`${baseUrl}/wp-json/wp/v2/tour?per_page=100&_embed`, env);
    const result = {
        tours: Array.isArray(posts) ? posts.map(transformTour) : [],
        testimonials: [],
    };
    setCached(cacheKey, result);
    return result;
}

async function fetchBlogs(env) {
    const cacheKey = 'blogs';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const baseUrl = getBaseUrl(env);
    const posts = await wpFetch(`${baseUrl}/wp-json/wp/v2/posts?per_page=100&_embed`, env);
    const result = {
        blogs: Array.isArray(posts) ? posts.map(transformBlog) : [],
    };
    setCached(cacheKey, result);
    return result;
}

async function fetchPage(slug, env) {
    const cacheKey = `page:${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const baseUrl = getBaseUrl(env);
    const pages = await wpFetch(
        `${baseUrl}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&_embed`,
        env
    );
    const page = Array.isArray(pages) && pages.length > 0 ? pages[0] : null;
    setCached(cacheKey, page);
    return page;
}

async function fetchSettings(env) {
    const page = await fetchPage('site-settings', env);
    if (!page) return null;
    const acf = page.acf || {};
    return Object.keys(acf).length > 0 ? acf : null;
}

async function fetchContact(env) {
    const page = await fetchPage('contact', env);
    if (!page) return null;
    const acf = page.acf || {};
    return Object.keys(acf).length > 0 ? acf : null;
}

// ── Slideshow ──────────────────────────────────────────────────────────────
// Reads slides from a WordPress page with slug "slideshow".
// ACF field group expected: a repeater field "slides" with sub-fields
// name, image (URL), and gradient (CSS string).
async function fetchSlideshow(env) {
    const cacheKey = 'slideshow';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const page = await fetchPage('slideshow', env);
    const acf = (page && page.acf) || {};
    const result = { slides: Array.isArray(acf.slides) ? acf.slides : [] };
    setCached(cacheKey, result);
    return result;
}

// ── Homepage ───────────────────────────────────────────────────────────────
// Reads homepage-specific settings from a WordPress page with slug "home".
// ACF field group can include hero, stats, or any home-page overrides.
async function fetchHomepage(env) {
    const cacheKey = 'homepage';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const page = await fetchPage('home', env);
    const acf = (page && page.acf) || {};
    const result = Object.keys(acf).length > 0 ? acf : null;
    setCached(cacheKey, result);
    return result;
}

// ── Gallery ────────────────────────────────────────────────────────────────
// Reads gallery items from a WordPress page with slug "gallery".
// ACF field group expected: a repeater field "gallery" with sub-fields
// image (URL), caption, and alt.
async function fetchGallery(env) {
    const cacheKey = 'gallery';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const page = await fetchPage('gallery', env);
    const acf = (page && page.acf) || {};
    const result = { gallery: Array.isArray(acf.gallery) ? acf.gallery : [] };
    setCached(cacheKey, result);
    return result;
}

// ── Promotions ─────────────────────────────────────────────────────────────
// Reads promotions from the "promotion" custom post type.
// Required WP plugin: Custom Post Type UI (CPT slug: promotion)
// ACF fields: title, description, discount, valid_until, image, active.
async function fetchPromotions(env) {
    const cacheKey = 'promotions';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const baseUrl = getBaseUrl(env);
    const posts = await wpFetch(`${baseUrl}/wp-json/wp/v2/promotion?per_page=100&_embed`, env);
    const result = {
        promotions: Array.isArray(posts) ? posts.map(transformPromotion) : [],
    };
    setCached(cacheKey, result);
    return result;
}

// ── Destinations ───────────────────────────────────────────────────────────
// Reads destinations from the "destination" custom post type.
// Required WP plugin: Custom Post Type UI (CPT slug: destination)
// ACF fields: name, description, image, photo_url, featured.
async function fetchDestinations(env) {
    const cacheKey = 'destinations';
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const baseUrl = getBaseUrl(env);
    const posts = await wpFetch(`${baseUrl}/wp-json/wp/v2/destination?per_page=100&_embed`, env);
    const result = {
        destinations: Array.isArray(posts) ? posts.map(transformDestination) : [],
    };
    setCached(cacheKey, result);
    return result;
}

module.exports = {
    fetchTours,
    fetchBlogs,
    fetchPage,
    fetchSettings,
    fetchContact,
    fetchSlideshow,
    fetchHomepage,
    fetchGallery,
    fetchPromotions,
    fetchDestinations,
    isWordPressConfigured,
    clearCache,
    stripHtml,
    transformTour,
    transformBlog,
    transformSlide,
    transformPromotion,
    transformDestination,
};
