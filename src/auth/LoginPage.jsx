import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';
import iconLight from '../assets/icon-light.png';
import iconDark from '../assets/icon-dark.png';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [isDark, setIsDark] = useState(() => {
      return localStorage.getItem('theme') === 'dark' || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (formData) => {
    try {
      setError('');
      setLoading(true);
      
      await login(formData.username, formData.password);
      
      navigate('/');
      
    } catch (err) {
      let errorMessage = 'Неверное имя пользователя или пароль';
      
      if (err.response) {
        // Ошибка от сервера
        const status = err.response.status;
        if (status === 401) {
          errorMessage = 'Неверное имя пользователя или пароль';
        } else if (status === 400) {
          errorMessage = err.response.data?.error || err.response.data?.message || 'Неверный запрос';
        } else if (status === 500) {
          errorMessage = 'Ошибка сервера. Попробуйте позже';
        } else {
          errorMessage = err.response.data?.error || err.response.data?.message || errorMessage;
        }
      } else if (err.request) {
        errorMessage = 'Не удалось подключиться к серверу. Проверьте подключение к интернету';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-black dark:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src={isDark ? iconDark : iconLight}
            alt="Instagram"
            className="h-12 object-contain"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Войти в аккаунт
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Нет аккаунта?{' '}
          <Link 
            to="/register" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {location.state?.message && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {location.state.message}
            </div>
          )}


          {/* Форма входа */}
          <LoginForm 
            onSubmit={handleLogin} 
            loading={loading}
            error={error}
            onErrorClear={() => setError('')}
          />
          </div>
        </div>
      </div>
  );
};

export default LoginPage;

