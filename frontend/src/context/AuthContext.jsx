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

  // Step 1 of sign-up: sends an OTP to the email. The user is NOT logged in yet.
  const register = useCallback((data) => authApi.register(data), []);

  // Step 2: verify the OTP, which also logs the user in
  const verifyOtp = useCallback(async (payload) => {
    const { user: u, token } = await authApi.verifyOtp(payload);
    tokenStore.set(token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => { tokenStore.clear(); setUser(null); }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
