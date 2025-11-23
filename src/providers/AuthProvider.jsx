import { createContext, useContext, useState, useEffect } from "react";
import { mockApi } from "../utils/mockApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, _setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    async function login({ username, code }) {
        setLoading(true);
        try {
            const res = await mockApi.login({ username, code });
            if (res.ok) {
                _setUser(res.user);
            }
            return res;
        } finally {
            setLoading(false);
        }
    }

    async function logout() {
        setLoading(true);
        try {
            await mockApi.logout();
            _setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function setUser(u) {
        _setUser({ ...user, ...u });
    }

    const value = {
        user,
        setUser,
        loading,
        isLoggedIn: !!user,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
