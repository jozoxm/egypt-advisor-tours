const cache = new Map();

function parsePositiveInt(value, fallback) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getCacheTtl(env) {
    return parsePositiveInt((env || process.env).WORDPRESS_CACHE_TTL_MS, 5 * 60 * 1000);
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

function transformTour(post) {
    const embedded = post._embedded || {};
    const featuredMedia = (embedded['wp:featuredmedia'] || [])[0];
    const acf = post.acf || {};
    const terms = (embedded['wp:term'] || []).flat();
    const categories = terms.filter((t) => t.taxonomy === 'category').map((t) => t.name);
    const image = featuredMedia ? featuredMedia.source_url : '';

    return {
        id: post.id,
        name: acf.name || (post.title && post.title.rendered) || '',
        description: acf.description || (post.content && post.content.rendered) || '',
        excerpt: acf.excerpt || (post.excerpt && post.excerpt.rendered) || '',
        duration: acf.duration || '',
        image: acf.image || image || '🏛️',
        photoUrl: acf.photoUrl || acf.photo_url || image || '',
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
    const image = featuredMedia ? featuredMedia.source_url : '';

    return {
        id: post.id,
        title: acf.title || (post.title && post.title.rendered) || '',
        author: acf.author || (authorEntry && authorEntry.name) || 'Egypt Advisor Team',
        date: acf.date || post.date || '',
        excerpt: acf.excerpt || (post.excerpt && post.excerpt.rendered) || '',
        content: acf.content || (post.content && post.content.rendered) || '',
        image: acf.image || image || '🗺️',
        category: acf.category || categories[0] || '',
        featured: Boolean(acf.featured),
        slug: post.slug || '',
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

module.exports = {
    fetchTours,
    fetchBlogs,
    fetchPage,
    fetchSettings,
    fetchContact,
    isWordPressConfigured,
    clearCache,
    transformTour,
    transformBlog,
};
