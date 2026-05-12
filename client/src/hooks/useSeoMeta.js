import { useEffect } from 'react';
import getSiteUrl from '../utils/siteUrl';

const BASE_TITLE = 'Egypt Advisor Tours';
const TITLE_SEPARATOR = ' | ';
const FALLBACK_DESCRIPTION =
  'Private Egypt tours, Nile cruises, destination guides, and expert travel planning with Egypt Advisor Tours.';
const DEFAULT_OG_IMAGE = '/Gold Logo.png?v=5';

function toAbsoluteUrl(value, siteUrl) {
  if (!value) return '';
  try {
    return new URL(value, `${siteUrl}/`).toString();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Invalid SEO URL value:', value, error);
    }
    return '';
  }
}

function upsertMeta(name, content, key = 'name') {
  if (!content) return;
  const selector = `meta[${key}="${name}"]`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(key, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

function upsertJsonLd(structuredData) {
  const id = 'seo-json-ld';
  const existing = document.head.querySelector(`#${id}`);
  if (!structuredData) {
    if (existing) existing.remove();
    return;
  }

  const payload = JSON.stringify(structuredData);
  if (existing) {
    existing.textContent = payload;
    return;
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = payload;
  document.head.appendChild(script);
}

const useSeoMeta = ({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  noindex = false,
  structuredData,
}) => {
  useEffect(() => {
    const siteUrl = getSiteUrl();
    const fullTitle = title ? `${title}${TITLE_SEPARATOR}${BASE_TITLE}` : BASE_TITLE;
    const finalDescription = description || FALLBACK_DESCRIPTION;
    const canonicalUrl = toAbsoluteUrl(path, siteUrl);
    const imageUrl = toAbsoluteUrl(image || DEFAULT_OG_IMAGE, siteUrl);

    document.title = fullTitle;
    upsertMeta('description', finalDescription);
    upsertMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertLink('canonical', canonicalUrl);

    upsertMeta('og:title', fullTitle, 'property');
    upsertMeta('og:description', finalDescription, 'property');
    upsertMeta('og:type', type, 'property');
    upsertMeta('og:url', canonicalUrl, 'property');
    upsertMeta('og:image', imageUrl, 'property');
    upsertMeta('og:site_name', BASE_TITLE, 'property');

    upsertMeta('twitter:card', 'summary_large_image');
    upsertMeta('twitter:title', fullTitle);
    upsertMeta('twitter:description', finalDescription);
    upsertMeta('twitter:image', imageUrl);

    upsertJsonLd(structuredData);
  }, [title, description, path, image, type, noindex, structuredData]);
};

export default useSeoMeta;
