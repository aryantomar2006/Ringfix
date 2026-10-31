import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/services';
import { tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenStore.get()) { setLoading(false); return; }
    authApi.me()
      .then((d) => setUser(d.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (creds) => {
    const { user: u, token } = await authApi.login(creds);
    tokenStore.set(token);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data) => {
    const { user: u, token } = await authApi.register(data);
    tokenStore.set(token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => { tokenStore.clear(); setUser(null); }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
