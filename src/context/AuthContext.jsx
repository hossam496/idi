import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * Simple deterministic hash of a string (djb2 algorithm).
 * Produces the same numeric hash for the same email every time,
 * so a user who logs in twice always gets the same ID and data.
 */
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Load the user registry from localStorage.
 * Format: { "email@example.com": { id, name, password, ... }, ... }
 */
function loadRegistry() {
  try {
    const raw = localStorage.getItem('idi_registered_users');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveRegistry(registry) {
  localStorage.setItem('idi_registered_users', JSON.stringify(registry));
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage on mount
    const storedUser = localStorage.getItem('idi_user');
    const token = localStorage.getItem('idi_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Validation
      if (!email || !password) {
        throw new Error('Inserire email e password.');
      }

      const normalizedEmail = email.trim().toLowerCase();
      const registry = loadRegistry();

      // Check if this email is registered
      if (registry[normalizedEmail]) {
        // Verify password
        if (registry[normalizedEmail].password !== password) {
          throw new Error('Password non corretta. / كلمة المرور غير صحيحة.');
        }
        // Return existing user with their stable ID
        const existingUser = {
          id: registry[normalizedEmail].id,
          name: registry[normalizedEmail].name,
          email: normalizedEmail,
          avatar: registry[normalizedEmail].avatar || null,
          role: 'student',
          joinedDate: registry[normalizedEmail].joinedDate,
        };
        const mockToken = `mock-jwt-token-${existingUser.id}`;

        localStorage.setItem('idi_user', JSON.stringify(existingUser));
        localStorage.setItem('idi_token', mockToken);
        setUser(existingUser);
        return existingUser;
      }

      // Not registered — auto-register for easy evaluation (demo mode)
      const userId = `user_${hashString(normalizedEmail)}`;
      const mockUser = {
        id: userId,
        name: normalizedEmail.split('@')[0].replace(/[._]/g, ' '),
        email: normalizedEmail,
        avatar: null,
        role: 'student',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      const mockToken = `mock-jwt-token-${userId}`;

      // Save to registry
      registry[normalizedEmail] = {
        id: userId,
        name: mockUser.name,
        password: password,
        avatar: null,
        joinedDate: mockUser.joinedDate,
      };
      saveRegistry(registry);

      localStorage.setItem('idi_user', JSON.stringify(mockUser));
      localStorage.setItem('idi_token', mockToken);
      setUser(mockUser);
      return mockUser;
    } catch (err) {
      setError(err.message || 'Credenziali non valide.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!name || !email || !password) {
        throw new Error('Compilare tutti i campi.');
      }

      const normalizedEmail = email.trim().toLowerCase();
      const registry = loadRegistry();

      // Check if already registered
      if (registry[normalizedEmail]) {
        throw new Error('Questa email è già registrata. Effettua il login. / هذا البريد مسجل بالفعل. قم بتسجيل الدخول.');
      }

      // Deterministic ID from email
      const userId = `user_${hashString(normalizedEmail)}`;
      const mockUser = {
        id: userId,
        name: name,
        email: normalizedEmail,
        avatar: null,
        role: 'student',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      const mockToken = `mock-jwt-token-${userId}`;

      // Save to registry
      registry[normalizedEmail] = {
        id: userId,
        name: name,
        password: password,
        avatar: null,
        joinedDate: mockUser.joinedDate,
      };
      saveRegistry(registry);

      localStorage.setItem('idi_user', JSON.stringify(mockUser));
      localStorage.setItem('idi_token', mockToken);
      setUser(mockUser);
      return mockUser;
    } catch (err) {
      setError(err.message || 'Errore durante la registrazione.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('idi_user');
    localStorage.removeItem('idi_token');
    setUser(null);
  };

  const updateProfile = async (updatedData) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const updatedUser = { ...user, ...updatedData };
      localStorage.setItem('idi_user', JSON.stringify(updatedUser));

      // Also update the registry entry
      const registry = loadRegistry();
      if (registry[user.email]) {
        registry[user.email] = {
          ...registry[user.email],
          name: updatedUser.name,
          avatar: updatedUser.avatar,
        };
        saveRegistry(registry);
      }

      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError('Impossibile aggiornare il profilo.');
      throw err;
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
};
