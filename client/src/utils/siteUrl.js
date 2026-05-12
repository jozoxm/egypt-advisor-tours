const DEFAULT_SITE_URL = 'https://egyptadvisortours.com';

const getSiteUrl = () => {
  const envUrl = process.env.REACT_APP_SITE_URL || DEFAULT_SITE_URL;
  return envUrl.replace(/\/+$/, '');
};

export default getSiteUrl;
