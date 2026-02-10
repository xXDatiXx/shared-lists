import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentUser,
  loginWithToken,
  initializeAdmin,
  logout as doLogout,
  type User,
} from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check URL for token param
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      const found = loginWithToken(token);
      if (found) {
        setUser(found);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    } else {
      const stored = getCurrentUser();
      setUser(stored);
    }

    // Ensure admin exists
    initializeAdmin();
    setLoading(false);
  }, []);

  const login = useCallback((token: string): boolean => {
    const found = loginWithToken(token);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    doLogout();
    setUser(null);
  }, []);

  return { user, loading, login, logout, isAdmin: user?.isAdmin ?? false };
}
