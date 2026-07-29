import { createContext, useContext, useEffect, useState } from 'react';
import * as api from './api.js';
import i18n from './i18n.js';

const AuthContext = createContext(null);

// Wraps setUser so that whenever a user (with a persisted locale) becomes
// active — initial load, login, register, or a profile edit — i18next
// switches to match. Accepts a plain value or a functional updater, same
// as the underlying setState, so existing callers don't need to change.
function applyUserUpdate(setUser, update) {
  setUser((prev) => {
    const next = typeof update === 'function' ? update(prev) : update;
    if (next?.locale) {
      i18n.changeLanguage(next.locale);
    }
    return next;
  });
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = (update) => applyUserUpdate(setUserState, update);

  useEffect(() => {
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setUserState(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const data = await api.login(credentials);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await api.register(payload);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await api.logout();
    setUserState(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
