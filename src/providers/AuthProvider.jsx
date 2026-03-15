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
        } finally {
            setLoading(false);
        }
    }

    async function register({ username, password }) {
        setLoading(true);
        try {
            const res = await mockApi.register({ username, password });
            if (res.ok) _setUser(res.user);
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

    function setUser(u) {
        _setUser(prev => ({ ...prev, ...u }));
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, isLoggedIn: !!user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}