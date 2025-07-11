import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../../api/auth.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('farmDirectToken');
    const savedUser = localStorage.getItem('farmDirectUser');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('farmDirectToken');
        localStorage.removeItem('farmDirectUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const result = await loginUser(username, password);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const { access_token, user_id, username: userName, user_type } = result.data;

      const userData = {
        id: user_id,
        username: userName,
        userType: user_type,
      };

      setToken(access_token);
      setUser(userData);

      // Save to localStorage
      localStorage.setItem('farmDirectToken', access_token);
      localStorage.setItem('farmDirectUser', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const result = await registerUser(userData);
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('farmDirectToken');
    localStorage.removeItem('farmDirectUser');
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
