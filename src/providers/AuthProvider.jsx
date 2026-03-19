import { createContext, useContext, useState, useEffect } from "react";
import { authApi, usersApi, tokenStore } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, _setUser]   = useState(null);
  const [loading, setLoading] = useState(true); // true on mount while we verify token

  // On mount — if token exists, verify it and restore session
  useEffect(() => {
    async function restoreSession() {
      const token = tokenStore.get();
      if (!token) { setLoading(false); return; }

      const res = await usersApi.me();
      if (res.ok) {
        _setUser(res.data.user);
      } else {
        // Token invalid/expired — clear it
        tokenStore.clear();
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  async function login({ username, password }) {
    const res = await authApi.login(username, password);
    if (res.ok) {
      tokenStore.set(res.data.access_token);
      _setUser(res.data.user);
    }
    return res;
  }

  async function register({ username, password }) {
    const res = await authApi.register(username, password);
    if (res.ok) {
      tokenStore.set(res.data.access_token);
      _setUser(res.data.user);
    }
    return res;
  }

  async function logout() {
    await authApi.logout();
    tokenStore.clear();
    _setUser(null);
  }

  function setUser(u) {
    _setUser(prev => ({ ...prev, ...u }));
  }

  async function updateUsername({ newUsername, password }) {
    const res = await usersApi.updateUsername(newUsername, password);
    if (res.ok) _setUser(res.data.user);
    return res;
  }

  async function updateEmail({ email, password }) {
  const res = await usersApi.updateEmail(email, password);
  if (res.ok) _setUser(res.data.user);
  return res;
}

  async function updatePassword({ currentPassword, newPassword }) {
    return await usersApi.updatePassword(currentPassword, newPassword);
  }

  async function deleteAccount({ password }) {
    const res = await usersApi.deleteAccount(password);
    if (res.ok) {
      tokenStore.clear();
      _setUser(null);
    }
    return res;
  }

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      isLoggedIn: !!user,
      isAdmin: !!user?.is_admin,
      login,
      logout,
      register,
      updateUsername,
      updateEmail,
      updatePassword,
      deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}