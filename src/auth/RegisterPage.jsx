import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (userData) => {
    try {
      setError('');
      setLoading(true);
      
      await register(userData);
      navigate('/login', { 
        state: { 
          message: 'Регистрация успешна' 
        } 
      });
      
    } catch (err) {
      let errorMessage = 'Ошибка регистрации';
    
      if (err.response) {
        const status = err.response.status;
    
        if (status === 400) {
          errorMessage =
            err.response.data?.error ||
            err.response.data?.message ||
            'Пользователь с таким именем уже существует';
        } else if (status === 500) {
          errorMessage = 'Ошибка сервера. Попробуйте позже';
        }
      } else if (err.request) {
        errorMessage = 'Нет ответа от сервера. Проверьте подключение к интернету';
      }
    
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Создать аккаунт
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Уже есть аккаунт?{' '}
          <Link 
            to="/login" 
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Войти
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Форма регистрации */}
          <RegisterForm 
            onSubmit={handleRegister} 
            loading={loading}
          />
          </div>
        </div>
      </div>

  
  );
};

export default RegisterPage;