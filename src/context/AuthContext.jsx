import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
  const loadUser = async () => {
    const storedToken = localStorage.getItem('token');
    console.log('TOKEN FROM LS:', storedToken);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getProfile();
      console.log('USER LOADED:', userData);
      setUser(userData);
      setToken(storedToken);
    } catch (e) {
      console.log('PROFILE LOAD ERROR', e);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  loadUser();
}, []);

  const login = async (username, password) => {
    const response = await authService.login(username, password);
    const userData = await authService.getProfile();
    setUser(userData);
    setToken(response.access_token);
  };
  
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };
  
  const isAuthenticated = !!token;
  
  const value = {
    token,
    user,
    setUser,
    login,
    register,
    logout,
    isAuthenticated,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};