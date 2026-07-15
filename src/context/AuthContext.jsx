import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── Bootstrap: restore session from localStorage token ──────────────────
  useEffect(() => {
    const token      = localStorage.getItem('idi_token');
    const storedUser = localStorage.getItem('idi_user');

    if (token && storedUser) {
      // Optimistically restore the user, then verify with the server
      setUser(JSON.parse(storedUser));
      authAPI.me()
        .then(res => {
          const fresh = res.data.data.user;
          setUser(fresh);
          localStorage.setItem('idi_user', JSON.stringify(fresh));
        })
        .catch(() => {
          // Token expired / invalid — clear everything
          localStorage.removeItem('idi_token');
          localStorage.removeItem('idi_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res         = await authAPI.login({ email, password });
      const { user: u, accessToken } = res.data.data;

      localStorage.setItem('idi_token', accessToken);
      localStorage.setItem('idi_user',  JSON.stringify(u));
      setUser(u);
      return u;
    } catch (err) {
      const msg = err.response?.data?.message || 'Credenziali non valide.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res         = await authAPI.register({ name, email, password });
      const { user: u, accessToken } = res.data.data;

      localStorage.setItem('idi_token', accessToken);
      localStorage.setItem('idi_user',  JSON.stringify(u));
      setUser(u);
      return u;
    } catch (err) {
      const msg = err.response?.data?.message || 'Errore durante la registrazione.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await authAPI.logout?.();
    } catch {
      // best-effort
    } finally {
      localStorage.removeItem('idi_token');
      localStorage.removeItem('idi_user');
      setUser(null);
    }
  };

  // ── Update Profile ────────────────────────────────────────────────────────
  const updateProfile = async (updatedData) => {
    setLoading(true);
    try {
      const res     = await authAPI.updateProfile(updatedData);
      const fresh   = res.data.data.user;
      localStorage.setItem('idi_user', JSON.stringify(fresh));
      setUser(fresh);
      return fresh;
    } catch (err) {
      const msg = err.response?.data?.message || 'Impossibile aggiornare il profilo.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve essere utilizzato all'interno di un AuthProvider");
  return ctx;
};
