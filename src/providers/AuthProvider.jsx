import { createContext, useContext, useState } from "react";
import { mockApi } from "../utils/mockApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, _setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  async function login({ username, password }) {
    setLoading(true);
    try {
      const res = await mockApi.login({ username, password });
      if (res.ok) _setUser(res.user);
      return res;
    } finally { setLoading(false); }
  }

  async function register({ username, password }) {
    setLoading(true);
    try {
      const res = await mockApi.register({ username, password });
      if (res.ok) _setUser(res.user);
      return res;
    } finally { setLoading(false); }
  }

  async function logout() {
    setLoading(true);
    try {
      await mockApi.logout();
      _setUser(null);
    } finally { setLoading(false); }
  }

  function setUser(u) {
    _setUser(prev => ({ ...prev, ...u }));
  }

  async function updateUsername({ newUsername, password }) {
    const res = await mockApi.updateUsername(user.id, { newUsername, password });
    if (res.ok) _setUser(res.user);
    return res;
  }

  async function updatePassword({ currentPassword, newPassword }) {
    return await mockApi.updatePassword(user.id, { currentPassword, newPassword });
  }

  async function updateEmail({ email, password }) {
    const res = await mockApi.updateEmail(user.id, { email, password });
    if (res.ok) _setUser(res.user);
    return res;
  }

  async function deleteAccount({ password }) {
    const res = await mockApi.deleteAccount(user.id, { password });
    if (res.ok) _setUser(null);
    return res;
  }

  return (
    <AuthContext.Provider value={{
      user, setUser, loading, isLoggedIn: !!user,
      login, logout, register,
      updateUsername, updatePassword, updateEmail, deleteAccount,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}