import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

const normalizeRole = (role) => {
  if (!role) return 'CANDIDATE';
  if (role === 'STUDENT') return 'CANDIDATE';
  return role;
};

const normalizeUser = (user) => {
  if (!user) return null;
  return { ...user, role: normalizeRole(user.role) };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('isp_token'));
  const [loading, setLoading] = useState(true);

  // On mount: restore user from token if valid
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('isp_token');
      if (!savedToken) { setLoading(false); return; }

      try {
        const savedUser = JSON.parse(localStorage.getItem('isp_user') || 'null');
        const isAdminSession = normalizeRole(savedUser?.role) === 'ADMIN';
        const res = isAdminSession ? await authAPI.getAdminMe() : await authAPI.getMe();
        if (res.data.success) setUser(normalizeUser(res.data.data));
        else logout();
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email: (email || '').trim(), password: (password || '').trim() });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data.data;
      const normalizedUser = normalizeUser(userData);
      localStorage.setItem('isp_token', newToken);
      localStorage.setItem('isp_user', JSON.stringify(normalizedUser));
      setToken(newToken);
      setUser(normalizedUser);
      return { success: true, user: normalizedUser };
    }
    return { success: false, message: res.data.message };
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    const res = await authAPI.adminLogin({ email: (email || '').trim(), password: (password || '').trim() });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data.data;
      const normalizedUser = normalizeUser({ ...userData, role: 'ADMIN' });
      localStorage.setItem('isp_token', newToken);
      localStorage.setItem('isp_user', JSON.stringify(normalizedUser));
      setToken(newToken);
      setUser(normalizedUser);
      return { success: true, user: normalizedUser };
    }
    return { success: false, message: res.data.message };
  }, []);

  const register = useCallback(async (name, email, password, college) => {
    const res = await authAPI.register({ name, email: (email || '').trim(), password: (password || '').trim(), college });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data.data;
      const normalizedUser = normalizeUser(userData);
      localStorage.setItem('isp_token', newToken);
      localStorage.setItem('isp_user', JSON.stringify(normalizedUser));
      setToken(newToken);
      setUser(normalizedUser);
      return { success: true, user: normalizedUser };
    }
    return { success: false, message: res.data.message };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('isp_token');
    localStorage.removeItem('isp_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      role: normalizeRole(user?.role),
      token,
      loading,
      login,
      adminLogin,
      register,
      logout,
      isAuthenticated: !!token,
      isAdmin: normalizeRole(user?.role) === 'ADMIN',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
