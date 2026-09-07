import { createContext, useContext } from 'react';

export const SettingsContext = createContext(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    return {
      settings: null,
      loading: false,
      refetchSettings: () => {},
    };
  }
  return context;
};

