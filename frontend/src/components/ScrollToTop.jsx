import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * A global route-based scroll restoration system that resets the window scroll 
 * position to the top whenever the pathname changes.
 * 
 * This ensures a consistent premium UX where navigating to a new page 
 * always starts the user at the beginning of the content.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // We use window.scrollTo with behavior: 'instant' to override any 
    // global CSS scroll-behavior: smooth, ensuring the jump happens 
    // immediately before the page transition animation completes.
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
    } catch (error) {
      // Fallback for older browsers that don't support ScrollToOptions
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
