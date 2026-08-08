import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from './services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on first load
  useEffect(() => {
    const saved = authService.loadSession();
    if (saved) {
      setUser(saved.user);
      setToken(saved.token);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await authService.signIn({ username, password });
    authService.saveSession(data.user, data.session.access_token);
    setUser(data.user);
    setToken(data.session.access_token);
    return data;
  };

  const register = async (username, password, userData) => {
    return authService.signUp({ username, password, userData });
  };

  const logout = async () => {
    await authService.signOut();
    authService.clearSession();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuth: Boolean(user && token),
        login,
        register,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth() {
  return useContext(AuthContext);
}