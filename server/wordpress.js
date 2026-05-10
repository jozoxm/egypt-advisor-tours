const { DEFAULT_WORDPRESS_BASE_URL } = require('./cms-config');

const WORDPRESS_SLUGS = {
  tours: process.env.WORDPRESS_TOURS_SLUG || 'cms-tours',
  contact: process.env.WORDPRESS_CONTACT_SLUG || 'cms-contact',
  blogs: process.env.WORDPRESS_BLOGS_SLUG || 'cms-blogs',
  gallery: process.env.WORDPRESS_GALLERY_SLUG || 'cms-gallery',
  slideshow: process.env.WORDPRESS_SLIDESHOW_SLUG || 'cms-slideshow',
  settings: process.env.WORDPRESS_SETTINGS_SLUG || 'cms-settings',
  promotions: process.env.WORDPRESS_PROMOTIONS_SLUG || 'cms-promotions',
  destinations: process.env.WORDPRESS_DESTINATIONS_SLUG || 'cms-destinations',
};

function normalizeBaseUrl(rawUrl) {
  if (!rawUrl) return '';
  const url = new URL(rawUrl);
  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
}

function getWordpressBaseUrl() {
  if (process.env.WORDPRESS_BASE_URL) {
    try {
      return normalizeBaseUrl(process.env.WORDPRESS_BASE_URL);
    } catch (_error) {
      return '';
    }
  }

  const provider = String(process.env.CMS_PROVIDER || 'auto').toLowerCase();
  if (provider === 'wordpress') {
    return DEFAULT_WORDPRESS_BASE_URL;
  }

  return '';
}

function isWordpressConfigured() {
  return Boolean(getWordpressBaseUrl());
}

function getWordpressAdminUrl() {
  const baseUrl = getWordpressBaseUrl() || DEFAULT_WORDPRESS_BASE_URL;
  return `${baseUrl}/wp-admin/`;
}

function getWordpressApiNamespace() {
  const namespace = process.env.WORDPRESS_API_NAMESPACE || 'egypt-advisor/v1';
  return namespace.replace(/^\/+|\/+$/g, '');
}

function normalizeResourceShape(key, data) {
  if (!data) return null;

  switch (key) {
    case 'tours':
      if (Array.isArray(data)) return { tours: data, testimonials: [] };
      return {
        tours: Array.isArray(data.tours) ? data.tours : [],
        testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
      };
    case 'blogs':
      if (Array.isArray(data)) return { blogs: data };
      return data.blogs ? data : { blogs: [] };
    case 'gallery':
      if (Array.isArray(data)) return { gallery: data };
      return data.gallery ? data : { gallery: [] };
    case 'slideshow':
      if (Array.isArray(data)) return { slides: data };
      return data.slides ? data : { slides: [] };
    case 'promotions':
      if (Array.isArray(data)) return { promotions: data };
      return data.promotions ? data : { promotions: [] };
    case 'destinations':
      if (Array.isArray(data)) return { destinations: data };
      return data.destinations ? data : { destinations: [] };
    case 'contact':
    case 'settings':
      return (typeof data === 'object' && !Array.isArray(data)) ? data : null;
    default:
      return data;
  }
}

function parseJsonContent(content) {
  if (!content || typeof content !== 'string') return null;
  const trimmed = content.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch (_error) {
    return null;
  }
}

function extractWordpressData(key, payload) {
  if (!payload) return null;

  if (Array.isArray(payload)) {
    const first = payload[0];
    if (!first || typeof first !== 'object') return null;
    const acf = first.acf || {};
    return normalizeResourceShape(
      key,
      acf[key] ||
      acf.payload ||
      acf.data ||
      parseJsonContent(first.content && first.content.rendered) ||
      acf
    );
  }

  if (typeof payload === 'object') {
    return normalizeResourceShape(key, payload[key] || payload.data || payload.payload || payload);
  }

  return null;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} for ${url}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function fetchWordpressResource(key) {
  const baseUrl = getWordpressBaseUrl();
  if (!baseUrl) {
    throw new Error('WordPress is not configured.');
  }

  const slug = WORDPRESS_SLUGS[key] || `cms-${key}`;
  const namespace = getWordpressApiNamespace();
  const candidates = [
    `${baseUrl}/wp-json/${namespace}/${key}`,
    `${baseUrl}/wp-json/${namespace}/content/${key}`,
    `${baseUrl}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=acf,content`,
    `${baseUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=acf,content`,
  ];

  let lastError = null;
  for (const endpoint of candidates) {
    try {
      const payload = await fetchJson(endpoint);
      const data = extractWordpressData(key, payload);
      if (data) {
        return data;
      }
      lastError = new Error(`No usable data at ${endpoint}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error(`Unable to fetch WordPress resource "${key}"`);
}

async function pingWordpress() {
  const baseUrl = getWordpressBaseUrl();
  if (!baseUrl) {
    throw new Error('WordPress is not configured.');
  }
  await fetchJson(`${baseUrl}/wp-json/`);
}

module.exports = {
  fetchWordpressResource,
  getWordpressAdminUrl,
  getWordpressBaseUrl,
  isWordpressConfigured,
  pingWordpress,
};
