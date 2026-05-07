const { storyblokInit, apiPlugin } = require('@storyblok/js');

function wrapToursPayload(data) {
  if (data && data.tours) {
    return data;
  }

  return {
    tours: Array.isArray(data) ? data : [],
    testimonials: Array.isArray(data?.testimonials) ? data.testimonials : [],
  };
}

function wrapObjectPayload(data) {
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
}

const RESOURCE_CONFIG = {
  tours: { slug: 'cms-tours', wrap: wrapToursPayload },
  contact: { slug: 'cms-contact', wrap: wrapObjectPayload },
  blogs: { slug: 'cms-blogs', wrap: (data) => (data && data.blogs ? data : { blogs: Array.isArray(data) ? data : [] }) },
  gallery: { slug: 'cms-gallery', wrap: (data) => (data && data.gallery ? data : { gallery: Array.isArray(data) ? data : [] }) },
  slideshow: { slug: 'cms-slideshow', wrap: (data) => (data && data.slides ? data : { slides: Array.isArray(data) ? data : [] }) },
  settings: { slug: 'cms-settings', wrap: wrapObjectPayload },
  promotions: { slug: 'cms-promotions', wrap: (data) => (data && data.promotions ? data : { promotions: Array.isArray(data) ? data : [] }) },
  destinations: { slug: 'cms-destinations', wrap: (data) => (data && data.destinations ? data : { destinations: Array.isArray(data) ? data : [] }) },
};

const STORYBLOK_META_FIELDS = new Set(['_uid', '_editable', 'component']);
const STORYBLOK_MANAGEMENT_API_URL = 'https://mapi.storyblok.com/v1';

let cachedClient = null;
let cachedClientKey = '';

function getStoryblokToken(env = process.env) {
  return env.STORYBLOK_PREVIEW_TOKEN || env.STORYBLOK_ACCESS_TOKEN || '';
}

function isStoryblokConfigured(env = process.env) {
  return Boolean(getStoryblokToken(env));
}

function getStoryblokRegion(env = process.env) {
  return env.STORYBLOK_REGION || 'eu';
}

function getStoryblokComponent(env = process.env) {
  return env.STORYBLOK_CONTENT_COMPONENT || 'json_document';
}

function getStoryblokSlug(resourceKey, env = process.env) {
  const customSlug = env[`STORYBLOK_${resourceKey.toUpperCase()}_SLUG`];
  return customSlug || RESOURCE_CONFIG[resourceKey]?.slug || resourceKey;
}

function getStoryblokAdminUrl(env = process.env) {
  if (env.STORYBLOK_EDITOR_URL) {
    return env.STORYBLOK_EDITOR_URL;
  }

  if (env.STORYBLOK_SPACE_ID) {
    return `https://app.storyblok.com/#/me/spaces/${env.STORYBLOK_SPACE_ID}/content/`;
  }

  return 'https://app.storyblok.com/';
}

function getStoryblokVersion(source = {}) {
  const query = source.query || source;
  const cookies = source.cookies || {};

  if (
    query.storyblok === 'draft' ||
    query.version === 'draft' ||
    query._storyblok ||
    query._storyblok_tk ||
    cookies.storyblokPreview === 'draft'
  ) {
    return 'draft';
  }

  return 'published';
}

function getStoryblokCacheVersion(source = {}) {
  const query = source.query || source;
  return query.cv || query._storyblok_release || undefined;
}

function getStoryblokClient(env = process.env) {
  const token = getStoryblokToken(env);
  const region = getStoryblokRegion(env);
  const cacheKey = `${token}:${region}`;

  if (!token) {
    return null;
  }

  if (!cachedClient || cachedClientKey !== cacheKey) {
    const { storyblokApi } = storyblokInit({
      accessToken: token,
      use: [apiPlugin],
      apiOptions: { region },
    });
    cachedClient = storyblokApi;
    cachedClientKey = cacheKey;
  }

  return cachedClient;
}

function parseJsonString(value, context) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`Invalid Storyblok JSON in ${context}: ${error.message}`);
  }
}

function stripStoryblokMetaFields(content = {}) {
  return Object.fromEntries(
    Object.entries(content).filter(([key]) => !STORYBLOK_META_FIELDS.has(key))
  );
}

function extractStoryblokPayload(story) {
  const content = story?.content || {};
  const storyIdentifier = story?.full_slug || story?.slug || 'unknown-story';

  if (content.data && typeof content.data === 'object' && !Array.isArray(content.data)) {
    return Object.keys(content.data).length > 0 ? content.data : null;
  }

  if (typeof content.json === 'string') {
    return parseJsonString(content.json, `${storyIdentifier}.content.json`);
  }

  if (typeof content.payload === 'string') {
    return parseJsonString(content.payload, `${storyIdentifier}.content.payload`);
  }

  const strippedContent = stripStoryblokMetaFields(content);
  return Object.keys(strippedContent).length > 0 ? strippedContent : null;
}

function normalizeStoryblokPayload(resourceKey, payload) {
  const config = RESOURCE_CONFIG[resourceKey];
  return config ? config.wrap(payload) : payload;
}

function isValidStoryblokPayload(resourceKey, payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return false;
  }

  switch (resourceKey) {
    case 'tours':
      return Array.isArray(payload.tours) && Array.isArray(payload.testimonials);
    case 'blogs':
      return Array.isArray(payload.blogs);
    case 'gallery':
      return Array.isArray(payload.gallery);
    case 'slideshow':
      return Array.isArray(payload.slides);
    case 'promotions':
      return Array.isArray(payload.promotions);
    case 'destinations':
      return Array.isArray(payload.destinations);
    case 'contact':
    case 'settings':
      return Object.keys(payload).length > 0;
    default:
      return true;
  }
}

async function fetchStoryblokStory(resourceKey, options = {}) {
  const env = options.env || process.env;
  const storyblokApi = getStoryblokClient(env);

  if (!storyblokApi) {
    return null;
  }

  const params = {
    version: options.version || 'published',
  };

  const cacheVersion = options.cv;
  if (cacheVersion) {
    params.cv = cacheVersion;
  }

  const slug = getStoryblokSlug(resourceKey, env);
  const { data } = await storyblokApi.get(`cdn/stories/${slug}`, params);
  return data?.story || null;
}

async function fetchStoryblokResource(resourceKey, options = {}) {
  const source = options.source || {};
  const slug = getStoryblokSlug(resourceKey, options.env || process.env);
  const story = await fetchStoryblokStory(resourceKey, {
    env: options.env,
    version: options.version || getStoryblokVersion(source),
    cv: options.cv || getStoryblokCacheVersion(source),
  });

  if (!story) {
    return null;
  }

  const payload = extractStoryblokPayload(story);
  if (payload === null) {
    throw new Error(`Storyblok story "${slug}" does not contain usable content.`);
  }

  const normalizedPayload = normalizeStoryblokPayload(resourceKey, payload);
  if (!isValidStoryblokPayload(resourceKey, normalizedPayload)) {
    throw new Error(`Storyblok story "${slug}" has an invalid content shape.`);
  }

  return normalizedPayload;
}

async function managementRequest(pathname, { env = process.env, method = 'GET', body } = {}) {
  const response = await fetch(`${STORYBLOK_MANAGEMENT_API_URL}${pathname}`, {
    method,
    headers: {
      Authorization: env.STORYBLOK_MANAGEMENT_TOKEN,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Storyblok Management API request failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

async function fetchManagementStory(resourceKey, env = process.env) {
  const slug = getStoryblokSlug(resourceKey, env);
  const data = await managementRequest(
    `/spaces/${env.STORYBLOK_SPACE_ID}/stories?by_slugs=${encodeURIComponent(slug)}`,
    { env }
  );

  return data?.stories?.[0] || null;
}

async function updateStoryblokResource(resourceKey, payload, env = process.env) {
  const managementToken = env.STORYBLOK_MANAGEMENT_TOKEN;
  const spaceId = env.STORYBLOK_SPACE_ID;

  if (!managementToken) {
    return { persisted: false, reason: 'STORYBLOK_MANAGEMENT_TOKEN is required' };
  }

  if (!spaceId) {
    return { persisted: false, reason: 'STORYBLOK_SPACE_ID is required' };
  }

  const story = await fetchManagementStory(resourceKey, env);

  if (!story?.id) {
    throw new Error(
      `Storyblok story "${getStoryblokSlug(resourceKey, env)}" was not found. Run npm run sync:storyblok after creating the json_document component.`
    );
  }

  await managementRequest(`/spaces/${spaceId}/stories/${story.id}`, {
    env,
    method: 'PUT',
    body: JSON.stringify({
      story: {
        name: story.name,
        slug: story.slug,
        content: {
          component: story.content?.component || getStoryblokComponent(env),
          json: JSON.stringify(payload, null, 2),
        },
        is_startpage: Boolean(story.is_startpage),
      },
    }),
  });

  return { persisted: true };
}

module.exports = {
  RESOURCE_CONFIG,
  extractStoryblokPayload,
  fetchStoryblokResource,
  getStoryblokAdminUrl,
  getStoryblokComponent,
  getStoryblokSlug,
  getStoryblokToken,
  getStoryblokVersion,
  isStoryblokConfigured,
  normalizeStoryblokPayload,
  updateStoryblokResource,
};
