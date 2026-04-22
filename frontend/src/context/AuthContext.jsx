import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('healthAI_token') || null);
  const [refreshTokenValue, setRefreshTokenValue] = useState(localStorage.getItem('healthAI_refresh') || null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || '/api';
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // ─── Token Management ──────────────────────────────────────────
  const saveTokens = (accessToken, refreshToken) => {
    localStorage.setItem('healthAI_token', accessToken);
    if (refreshToken) localStorage.setItem('healthAI_refresh', refreshToken);
    setToken(accessToken);
    if (refreshToken) setRefreshTokenValue(refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem('healthAI_token');
    localStorage.removeItem('healthAI_refresh');
    setToken(null);
    setRefreshTokenValue(null);
    setUser(null);
  };

  // ─── Auto Refresh ──────────────────────────────────────────────
  const refreshAccessToken = useCallback(async () => {
    if (!refreshTokenValue) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });
      if (res.ok) {
        const data = await res.json();
        saveTokens(data.token, data.refreshToken);
        return data.token;
      }
      clearTokens();
      return null;
    } catch {
      clearTokens();
      return null;
    }
  }, [refreshTokenValue, API_BASE]);

  // ─── API Fetch with auto-refresh ──────────────────────────────
  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    let res = await fetch(url, { ...options, headers });

    // If token expired, try refresh
    if (res.status === 401) {
      const data = await res.json().catch(() => ({}));
      if (data.expired) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          headers.Authorization = `Bearer ${newToken}`;
          res = await fetch(url, { ...options, headers });
        }
      }
    }
    return res;
  }, [token, refreshAccessToken]);

  // ─── Fetch Profile on Load ────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else if (res.status === 401) {
          // Try refresh
          const newToken = await refreshAccessToken();
          if (newToken) {
            const res2 = await fetch(`${API_BASE}/auth/me`, {
              headers: { Authorization: `Bearer ${newToken}` }
            });
            if (res2.ok) {
              const data = await res2.json();
              setUser(data.user);
            } else {
              clearTokens();
            }
          } else {
            clearTokens();
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auth Methods ─────────────────────────────────────────────

  const loginWithGoogle = async (credential) => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    saveTokens(data.token, data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const verifyOTP = async (email, otp) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    if (data.token) {
      saveTokens(data.token, data.refreshToken);
      setUser(data.user);
    }
    return data;
  };

  const resendOTP = async (email) => {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const loginWithEmail = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    saveTokens(data.token, data.refreshToken);
    setUser(data.user);
    return data.user;
  };

  const forgotPassword = async (email) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const resetPassword = async (email, resetToken, newPassword) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: resetToken, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ refreshToken: refreshTokenValue })
      });
    } catch { /* ignore */ }
    clearTokens();
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, authFetch,
      loginWithGoogle, loginWithEmail,
      register, verifyOTP, resendOTP,
      forgotPassword, resetPassword,
      logout,
    }}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {children}
      </GoogleOAuthProvider>
    </AuthContext.Provider>
  );
};
