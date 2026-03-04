import React, { createContext, useContext, useState } from 'react';

export const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);

    const login = (userData, tokenValue) => {
        setUser(userData);
        setToken(tokenValue);
        localStorage.setItem('user',  JSON.stringify(userData));
        localStorage.setItem('token', tokenValue);
    };

    const logout = async () => {
        try {
            await fetch('/api/logout', {
                method:  'POST',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
        } catch (_) { /* ignore */ }
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
