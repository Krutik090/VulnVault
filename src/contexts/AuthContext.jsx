// =======================================================================
// FILE: src/contexts/AuthContext.jsx
// PURPOSE: Manages global authentication state (replaces auth.service.ts).
// =======================================================================
import { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Helper function to read a specific cookie
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // This effect runs once on app load to check for an existing session
  useEffect(() => {
    try {
      const userDataCookie = getCookie('userData');
      if (userDataCookie) {
        const parsedUser = JSON.parse(decodeURIComponent(userDataCookie));
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user data from cookie", error);
      // Clear potentially corrupted cookies
      document.cookie = "userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:6002/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // The httpOnly token cookie is set by the browser automatically.
      // We just need to update the user state with the response data.
      setUser({ name: data.name, id: data.id, role: data.role });
      toast.success('Logged in successfully!');
      return data; // Return user data for navigation
    } catch (error) {
      toast.error(error.message);
      throw error; // Re-throw error to be caught in the component
    }
  };

  const logout = async () => {
    try {
        await fetch('/api/users/logout', { method: 'POST' });
        // Cookies are cleared by the backend. We just update the local state.
        setUser(null);
        // The page will redirect via the App.jsx logic
        toast.success('Logged out successfully.');
    } catch (error) {
        toast.error('Logout failed. Please try again.');
    }
  };

  const value = { user, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

