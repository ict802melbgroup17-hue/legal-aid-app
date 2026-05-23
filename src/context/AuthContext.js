import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem('legalAidSession');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistSession = (sessionUser) => {
    setUser(sessionUser);
    if (sessionUser) {
      sessionStorage.setItem('legalAidSession', JSON.stringify(sessionUser));
    } else {
      sessionStorage.removeItem('legalAidSession');
    }
  };

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const sessionUser = await api.login(credentials);
      persistSession(sessionUser);
      return sessionUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const sessionUser = await api.register(payload);
      persistSession(sessionUser);
      return sessionUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setError(null);
    persistSession(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, login, register, logout, setError }),
    [user, loading, error, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
