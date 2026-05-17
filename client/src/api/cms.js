const API_URL = process.env.REACT_APP_API_URL || '';

const fetchCmsResource = async (endpoint) => {
  const response = await fetch(`${API_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch CMS resource: ${endpoint}`);
  }
  return response.json();
};

export const getNavigation = () => fetchCmsResource('/api/navigation');
export const getFooter = () => fetchCmsResource('/api/footer');
export const getHomepage = () => fetchCmsResource('/api/homepage');
export const getAbout = () => fetchCmsResource('/api/about');
export const getFaq = () => fetchCmsResource('/api/faq');
export const getTailorTrip = () => fetchCmsResource('/api/tailor-trip');

