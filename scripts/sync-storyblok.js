'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const {
  RESOURCE_CONFIG,
  getStoryblokComponent,
  getStoryblokSlug,
} = require('../server/storyblok');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = process.env.DATA_PATH && path.isAbsolute(process.env.DATA_PATH)
  ? process.env.DATA_PATH
  : path.join(ROOT, 'server', 'data');

function requireMatch(content, regex, label) {
  const match = content.match(regex);
  if (!match) {
    throw new Error(`Could not extract ${label} from source content.`);
  }
  return match;
}

const SOURCE_MAP = {
  tours: {
    jsonPath: path.join(DATA_DIR, 'tours.json'),
    jsPath: path.join(ROOT, 'client/src/data/tours-data.js'),
    readFromJs: (content) => {
      const toursMatch = content.match(/export const tours\s*=\s*(\[[\s\S]*?\]);/);
      const testimonialsMatch = content.match(/export const testimonials\s*=\s*(\[[\s\S]*?\]);/);
      return {
        tours: toursMatch ? JSON.parse(toursMatch[1]) : [],
        testimonials: testimonialsMatch ? JSON.parse(testimonialsMatch[1]) : [],
      };
    },
  },
  contact: {
    jsonPath: path.join(DATA_DIR, 'contact.json'),
    jsPath: path.join(ROOT, 'client/src/data/contact-info.js'),
    readFromJs: (content) => JSON.parse(requireMatch(content, /export const contactInfo\s*=\s*({[\s\S]*?});/, 'contact info')[1]),
  },
  blogs: {
    jsonPath: path.join(DATA_DIR, 'blogs.json'),
    jsPath: path.join(ROOT, 'client/src/data/blogs-data.js'),
    readFromJs: (content) => ({ blogs: JSON.parse(requireMatch(content, /export const blogs\s*=\s*(\[[\s\S]*?\]);/, 'blogs')[1]) }),
  },
  gallery: {
    jsonPath: path.join(DATA_DIR, 'gallery.json'),
    jsPath: path.join(ROOT, 'client/src/data/gallery-data.js'),
    readFromJs: (content) => ({ gallery: JSON.parse(requireMatch(content, /export const gallery\s*=\s*(\[[\s\S]*?\]);/, 'gallery')[1]) }),
  },
  slideshow: {
    jsonPath: path.join(DATA_DIR, 'slideshow.json'),
    jsPath: path.join(ROOT, 'client/src/data/slideshow-data.js'),
    readFromJs: (content) => ({ slides: JSON.parse(requireMatch(content, /export const slides\s*=\s*(\[[\s\S]*?\]);/, 'slideshow')[1]) }),
  },
  settings: {
    jsonPath: path.join(DATA_DIR, 'settings.json'),
    jsPath: path.join(ROOT, 'client/src/data/site-settings.js'),
    readFromJs: (content) => JSON.parse(requireMatch(content, /export const siteSettings\s*=\s*({[\s\S]*?});/, 'site settings')[1]),
  },
  promotions: {
    jsonPath: path.join(DATA_DIR, 'promotions.json'),
    jsPath: path.join(ROOT, 'client/src/data/promotions-data.js'),
    readFromJs: (content) => ({ promotions: JSON.parse(requireMatch(content, /export const promotions\s*=\s*(\[[\s\S]*?\]);/, 'promotions')[1]) }),
  },
  destinations: {
    jsonPath: path.join(DATA_DIR, 'destinations.json'),
    jsPath: path.join(ROOT, 'client/src/data/destinations-data.js'),
    readFromJs: (content) => ({ destinations: JSON.parse(requireMatch(content, /export const destinations\s*=\s*(\[[\s\S]*?\]);/, 'destinations')[1]) }),
  },
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function loadPayload(key) {
  const source = SOURCE_MAP[key];
  if (!source) {
    throw new Error(`No source config for "${key}"`);
  }

  if (fs.existsSync(source.jsonPath)) {
    return JSON.parse(fs.readFileSync(source.jsonPath, 'utf8'));
  }

  if (!fs.existsSync(source.jsPath)) {
    throw new Error(`Source file not found for "${key}": ${source.jsPath}`);
  }

  return source.readFromJs(fs.readFileSync(source.jsPath, 'utf8'));
}

async function managementRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: process.env.STORYBLOK_MANAGEMENT_TOKEN,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  return response.json();
}

async function findExistingStory(spaceId, slug) {
  const url = `https://mapi.storyblok.com/v1/spaces/${spaceId}/stories?by_slugs=${encodeURIComponent(slug)}`;
  const data = await managementRequest(url);
  return data.stories?.[0] || null;
}

async function upsertStory(spaceId, key) {
  const slug = getStoryblokSlug(key);
  const name = slug.replace(/^cms-/, '').replace(/-/g, ' ');
  const payload = RESOURCE_CONFIG[key].wrap(loadPayload(key));
  const existingStory = await findExistingStory(spaceId, slug);
  const storyBody = {
    name,
    slug,
    content: {
      component: getStoryblokComponent(),
      json: JSON.stringify(payload, null, 2),
    },
    is_startpage: false,
  };

  if (existingStory?.id) {
    await managementRequest(
      `https://mapi.storyblok.com/v1/spaces/${spaceId}/stories/${existingStory.id}`,
      {
        method: 'PUT',
        body: JSON.stringify({ story: storyBody }),
      }
    );
    return { slug, action: 'updated' };
  }

  await managementRequest(`https://mapi.storyblok.com/v1/spaces/${spaceId}/stories`, {
    method: 'POST',
    body: JSON.stringify({ story: storyBody }),
  });
  return { slug, action: 'created' };
}

async function main() {
  requireEnv('STORYBLOK_MANAGEMENT_TOKEN');
  const spaceId = requireEnv('STORYBLOK_SPACE_ID');

  for (const key of Object.keys(SOURCE_MAP)) {
    const result = await upsertStory(spaceId, key);
    console.log(`[storyblok] ${result.action}: ${result.slug}`);
  }
}

main().catch((error) => {
  console.error('[storyblok] sync failed:', error.message);
  process.exit(1);
});
