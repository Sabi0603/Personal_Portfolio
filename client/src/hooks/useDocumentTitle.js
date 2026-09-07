import { useEffect } from 'react';

/**
 * Convenient wrapper hook to update only document.title without overwriting meta tags.
 *
 * @param {string} title
 */
export const useDocumentTitle = (title) => {
  useEffect(() => {
    if (typeof document === 'undefined' || !title) return;
    document.title = title;
  }, [title]);
};

export default useDocumentTitle;
