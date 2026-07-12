import { useEffect } from 'react';

const BASE_TITLE = 'Egypt Advisor Tours';

/**
 * Sets the document <title> for the current page.
 * Usage: useTitle('About Us')  → "About Us | Egypt Advisor Tours"
 *        useTitle()            → "Egypt Advisor Tours"
 */
const useTitle = (pageTitle) => {
  useEffect(() => {
    const previous = document.title;
    document.title = pageTitle ? `${pageTitle} | ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = previous;
    };
  }, [pageTitle]);
};

export default useTitle;
