// ✅ FIXED: AuthContext.jsx - Proper error handling and response parsing

import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6001';

const AuthContext = createContext(null);

const getCookie = (name) => {
    if (!name || typeof name !== 'string') return null;
    try {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            const cookieValue = parts.pop().split(';').shift();
            return cookieValue?.replace(/[<>]/g, '') || null;
        }
    } catch (error) {
        console.error(`Error reading cookie "${name}":`, error);
    }
    return null;
};

const sanitizeUserData = (userData) => {
    if (!userData || typeof userData !== 'object') return null;
    return {
        _id: String(userData._id || userData.id || '').substring(0, 100),
        id: String(userData._id || userData.id || '').substring(0, 100),
        name: String(userData.name || '').replace(/[<>]/g, '').substring(0, 100),
        email: String(userData.email || '').replace(/[<>]/g, '').substring(0, 100),
        role: String(userData.role || 'user').toLowerCase(),
    };
};

const isValidRole = (role) => {
    const validRoles = ['admin', 'tester', 'client', 'pmo'];
    return validRoles.includes(String(role).toLowerCase());
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize from cookie on mount
    useEffect(() => {
        try {
            const userDataCookie = getCookie('userData');
            if (userDataCookie) {
                const parsedUser = JSON.parse(decodeURIComponent(userDataCookie));
                if (parsedUser && isValidRole(parsedUser.role)) {
                    const sanitizedUser = sanitizeUserData(parsedUser);
                    setUser(sanitizedUser);
                    console.log('✅ User session restored', {
                        userId: sanitizedUser._id,
                        role: sanitizedUser.role,
                    });
                }
            }
        } catch (error) {
            console.error('❌ Failed to restore user session:', error);
            document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            setError('Failed to restore session');
        } finally {
            setLoading(false);
        }
    }, []);

    // Login function
    const login = useCallback(async (email, password) => {
        try {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            if (typeof email !== 'string' || typeof password !== 'string') {
                throw new Error('Invalid input type');
            }

            console.log('🔐 Login attempt for:', email.substring(0, 50));

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Send cookies
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // ✅ FIXED: Properly extract user data from response
            const userData = data.data?.user || data.user;

            if (!userData || !userData.role || !isValidRole(userData.role)) {
                throw new Error('Invalid user data in response');
            }

            const sanitizedUser = sanitizeUserData(userData);
            setUser(sanitizedUser);
            setError(null);

            console.log('✅ Authentication successful for role:', sanitizedUser.role);
            toast.success('Logged in successfully!');

            return sanitizedUser;

        } catch (error) {
            const errorMessage = error.message || 'Login failed';
            setError(errorMessage);
            console.error('❌ Login error:', errorMessage);
            toast.error(errorMessage);
            throw error;
        }
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        try {
            console.log('🔓 Logout initiated');

            const response = await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            setUser(null);
            setError(null);
            document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

            console.log('✅ Logout successful');
            toast.success('Logged out successfully');

        } catch (error) {
            const errorMessage = error.message || 'Logout failed';
            console.error('❌ Logout error:', errorMessage);
            toast.error(errorMessage);
            setUser(null);
            document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
    }, []);

    // Update user
    const updateUser = useCallback((userData) => {
        try {
            const sanitizedUser = sanitizeUserData(userData);
            if (!isValidRole(sanitizedUser.role)) {
                throw new Error('Invalid user role');
            }
            setUser(sanitizedUser);
            console.log('✅ User data updated');
        } catch (error) {
            console.error('Error updating user:', error);
            setError(error.message);
        }
    }, []);

    const isAuthenticated = useMemo(() => {
        return !!user && user._id && isValidRole(user.role);
    }, [user]);

    const value = {
        user,
        setUser: updateUser,
        login,
        logout,
        loading,
        error,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
