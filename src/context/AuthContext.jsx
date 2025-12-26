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
    // Проверяем токен при загрузке приложения
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Можно добавить запрос для получения данных пользователя
    }
    setLoading(false);
  }, []);
  
  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      const newToken = response.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      return response;
    } catch (error) {
      throw error;
    }
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