import { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

// Use the environment variable for the API base URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

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

  useEffect(() => {
    try {
      const userDataCookie = getCookie('userData');
      if (userDataCookie) {
        const parsedUser = JSON.parse(decodeURIComponent(userDataCookie));
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user data from cookie", error);
      document.cookie = "userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser({ name: data.name, id: data.id, role: data.role });
      toast.success('Logged in successfully!');
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
        await fetch(`${API_URL}/auth/logout`, { 
            method: 'POST',
            credentials: 'include',
        });
        setUser(null);
        toast.success('Logged out successfully.');
    } catch (error) {
        toast.error('Logout failed. Please try again.');
    }
  };

  // Expose setUser in the context value so other components can update the user state
  const value = { user, setUser, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
