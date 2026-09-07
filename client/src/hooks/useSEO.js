import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

/**
 * Helper to update or create a meta tag by name or property attribute.
 */
function setMetaTag(attribute, attrValue, content) {
  if (typeof document === 'undefined') return;

  let element = document.querySelector(`meta[${attribute}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attrValue);
    document.head.appendChild(element);
  }

  if (content !== undefined && content !== null) {
    element.setAttribute('content', content);
  }
}

/**
 * Helper to update or create a link tag (e.g. canonical).
 */
function setLinkTag(rel, href) {
  if (typeof document === 'undefined') return;

  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute(rel, rel);
    document.head.appendChild(element);
  }

  if (href) {
    element.setAttribute('href', href);
  }
}

/**
 * Custom React hook to dynamically manage document head SEO metadata.
 *
 * @param {Object} options
 * @param {string} [options.title] - Document title (defaults to Site Title from Site Settings)
 * @param {string} [options.description] - Meta description (defaults to Site Meta Description from Site Settings)
 * @param {string} [options.keywords] - Comma-separated or array of keywords (defaults to Site Keywords)
 * @param {string} [options.author] - Author name (defaults to Site Author)
 * @param {string} [options.canonical] - Canonical URL
 * @param {string} [options.ogTitle] - Open Graph title (defaults to title)
 * @param {string} [options.ogDescription] - Open Graph description (defaults to description)
 * @param {string} [options.ogImage] - Open Graph image URL (defaults to Site OG Image or SA-logo)
 * @param {string} [options.ogType] - Open Graph type ('website', 'article', etc.)
 * @param {string} [options.twitterCard] - Twitter card type ('summary_large_image', 'summary')
 * @param {boolean} [options.noIndex] - Set to true for admin/auth private pages (injects noindex, nofollow)
 * @param {Object} [options.structuredData] - Schema.org JSON-LD object to inject
 */
export function useSEO({
  title,
  description,
  keywords,
  author,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noIndex = false,
  structuredData,
} = {}) {
  const { settings } = useSettings();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Document Title
    const siteTitle = settings?.siteTitle?.trim() || 'Sabari M | MERN Stack Developer';
    const siteAuthor = settings?.author?.trim() || 'Sabari M';

    let fullTitle = siteTitle;
    if (title && title.trim()) {
      const trimmed = title.trim();
      fullTitle =
        trimmed.includes(siteAuthor) || trimmed.includes(siteTitle)
          ? trimmed
          : `${trimmed} | ${siteAuthor}`;
    }
    document.title = fullTitle;

    // 2. Robots Meta (Search indexing control)
    if (noIndex) {
      setMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      setMetaTag(
        'name',
        'robots',
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      );
    }

    // 3. Meta Description
    const defaultDesc =
      settings?.siteDescription?.trim() ||
      'Production-ready full-stack portfolio of Sabari M, a MERN Stack Developer crafting performant, accessible web applications.';
    const finalDesc = description && description.trim() ? description.trim() : defaultDesc;
    setMetaTag('name', 'description', finalDesc);

    // 4. Meta Author & Keywords
    const finalAuthor = author?.trim() || settings?.author?.trim() || 'Sabari M';
    setMetaTag('name', 'author', finalAuthor);

    const defaultKeywords =
      Array.isArray(settings?.keywords) && settings.keywords.length > 0
        ? settings.keywords
        : [
            'Sabari M',
            'MERN Stack Developer',
            'Full Stack Developer',
            'React',
            'Node.js',
            'Express',
            'MongoDB',
            'Tailwind CSS',
            'JavaScript',
            'Portfolio',
          ];
    const finalKeywords = keywords || defaultKeywords;
    const kwString = Array.isArray(finalKeywords) ? finalKeywords.join(', ') : finalKeywords;
    setMetaTag('name', 'keywords', kwString);

    // 5. Canonical Link
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const finalCanonical = canonical || (currentOrigin ? `${currentOrigin}${currentPath}` : '');
    if (finalCanonical) {
      setLinkTag('canonical', finalCanonical);
    }

    // 6. Open Graph Tags
    const finalOgTitle = ogTitle || fullTitle;
    const finalOgDesc = ogDescription || finalDesc;
    const defaultOgImage = settings?.ogImage?.url || `${currentOrigin}/SA-logo.svg`;
    const finalOgImage = ogImage || defaultOgImage;

    setMetaTag('property', 'og:site_name', siteTitle);
    setMetaTag('property', 'og:title', finalOgTitle);
    setMetaTag('property', 'og:description', finalOgDesc);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', finalCanonical);
    setMetaTag('property', 'og:image', finalOgImage);

    // 7. Twitter / X Card Tags
    setMetaTag('name', 'twitter:card', twitterCard);
    setMetaTag('name', 'twitter:title', finalOgTitle);
    setMetaTag('name', 'twitter:description', finalOgDesc);
    setMetaTag('name', 'twitter:image', finalOgImage);

    // 8. JSON-LD Structured Data
    let scriptElement = document.getElementById('seo-structured-data');
    if (structuredData) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'seo-structured-data';
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(structuredData);
    } else if (scriptElement) {
      scriptElement.remove();
    }

    // Cleanup on unmount
    return () => {
      if (noIndex) {
        // Reset to index, follow when leaving a noindex page
        setMetaTag('name', 'robots', 'index, follow');
      }
    };
  }, [
    title,
    description,
    keywords,
    author,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    twitterCard,
    noIndex,
    structuredData,
    settings,
  ]);
}

export default useSEO;


