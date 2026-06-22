const DEFAULT_SITE_URL = 'https://egyptadvisortours.com';

const getSiteUrl = () => {
  const envUrl = String(process.env.REACT_APP_SITE_URL || '').trim();
  const resolvedUrl = envUrl || DEFAULT_SITE_URL;
  return resolvedUrl.replace(/\/+$/, '');
};

export default getSiteUrl;
