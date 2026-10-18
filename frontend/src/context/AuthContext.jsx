import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDecodedToken, isTokenExpired } from '../utils/auth';
import { getProfile } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await getProfile();
      setProfile(data);
      if (data && data.role) {
        setUser((prev) => ({ ...(prev || {}), ...data }));
        localStorage.setItem('user_info', JSON.stringify(data));
      }
    } catch (err) {
      // profile fetch failure is non-critical
    }
  }, []);

  const login = useCallback(async (access, refresh, userData = null) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    if (userData) {
      localStorage.setItem('user_info', JSON.stringify(userData));
    }
    const decoded = getDecodedToken();
    const activeUser = { ...decoded, ...(userData || {}) };
    setUser(activeUser);
    await fetchProfile();
  }, [fetchProfile]);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !isTokenExpired(token)) {
      const decoded = getDecodedToken();
      let cachedUser = null;
      try {
        const raw = localStorage.getItem('user_info');
        if (raw) cachedUser = JSON.parse(raw);
      } catch (e) {
        // ignore parse error
      }
      setUser({ ...decoded, ...(cachedUser || {}) });
      fetchProfile().finally(() => setLoading(false));
    } else {
      if (token) localStorage.clear();
      setLoading(false);
    }
  }, [fetchProfile]);

  const isAuthenticated = Boolean(user && user.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        login,
        logout,
        isAuthenticated,
        loading,
        fetchProfile,
        reloadUser: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
