import { useState, useEffect, useCallback } from 'react';
import { SettingsContext } from './SettingsContext';
import { getSettings } from '../services/portfolioService';

const DEFAULT_SETTINGS = {
  siteTitle: 'Sabari M | MERN Stack Developer',
  siteDescription:
    'Production-ready full-stack portfolio of Sabari M, a MERN Stack Developer crafting performant, accessible web applications.',
  keywords: [
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
  ],
  author: 'Sabari M',
  enableContactForm: true,
  maintenanceMode: false,
  ogImage: { url: '', publicId: '' },
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refetchSettings = useCallback(async () => {
    try {
      const data = await getSettings();
      if (data) {
        setSettings((prev) => ({
          ...prev,
          ...data,
          keywords:
            Array.isArray(data.keywords) && data.keywords.length > 0
              ? data.keywords
              : prev.keywords,
        }));
      }
      return data;
    } catch {
      // Silently keep current settings
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getSettings()
      .then((data) => {
        if (isMounted && data) {
          setSettings((prev) => ({
            ...prev,
            ...data,
            keywords:
              Array.isArray(data.keywords) && data.keywords.length > 0
                ? data.keywords
                : prev.keywords,
          }));
        }
      })
      .catch(() => {
        // Silently fall back to DEFAULT_SETTINGS
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
