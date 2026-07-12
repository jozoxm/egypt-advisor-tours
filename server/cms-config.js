// Production default for WordPress mode when CMS_PROVIDER=wordpress and no explicit WORDPRESS_BASE_URL is provided.
const DEFAULT_WORDPRESS_BASE_URL = 'https://cms.egyptadvisortours.com';
const VALID_CMS_PROVIDERS = ['storyblok', 'wordpress', 'filesystem'];

module.exports = {
  DEFAULT_WORDPRESS_BASE_URL,
  VALID_CMS_PROVIDERS,
};
