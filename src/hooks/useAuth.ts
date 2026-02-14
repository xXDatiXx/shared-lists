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
    async function initialize() {
      try {
        // Check URL for token param
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        
        if (token) {
          const found = await loginWithToken(token);
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
        await initializeAdmin();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  const login = useCallback(async (token: string): Promise<boolean> => {
    const found = await loginWithToken(token);
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
