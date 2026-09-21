
import React, { createContext, useState, useEffect, useContext } from 'react';

import { loginUser, registerUser, getCurrentUser } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchUser = async () => {

      if (token) {

        try {

          const userData = await getCurrentUser();

          setUser(userData);

        } catch (err) {

          console.error("Token validation failed:", err);

          logout();

        }

      }

      setLoading(false);
    };

    fetchUser();

  }, [token]);

  const login = async (email, password) => {

    const data = await loginUser(email, password);

    localStorage.setItem('token', data.access_token);

    setToken(data.access_token);

    setUser(data.user);

    return data;
  };

  const register = async (name, email, password) => {

    const data = await registerUser(name, email, password);

    localStorage.setItem('token', data.access_token);

    setToken(data.access_token);

    setUser(data.user);

    return data;
  };

  const logout = () => {

    localStorage.removeItem('token');

    setToken(null);

    setUser(null);
  };

  // RBAC: Determine the role of the logged-in user
  const isAdmin = user?.role === 'admin';
  const isParent = user?.role === 'parent';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,

        // Authentication status
        isAuthenticated: !!token,

        // Role-based access
        isAdmin,
        isParent
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

