import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import * as authService from '../services/authService';

const TOKEN_KEY = 'admin_token';

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(localStorage.getItem(TOKEN_KEY));
  });

  // Restore authenticated session on mount
  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return;
    }

    authService
      .getMe()
      .then((adminUser) => {
        if (isMounted) {
          setAdmin(adminUser || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          localStorage.removeItem(TOKEN_KEY);
          setAdmin(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    if (data?.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      setAdmin(data.admin || null);
    }
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setAdmin(null);
    }
  }, []);

  const updateSessionToken = useCallback((newToken) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    }
  }, []);

  const value = {
    admin,
    isAuthenticated: Boolean(admin),
    loading,
    login,
    logout,
    updateSessionToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

