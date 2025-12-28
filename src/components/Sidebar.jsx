import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import iconLight from '../assets/icon-light.png';
import iconDark from '../assets/icon-dark.png';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, logout } = useAuth();

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const menuItems = [
    { 
      name: 'Главная', 
      path: '/', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H4a1 1 0 0 1-1-1V9.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        )
    },
    { 
      name: 'Поисковый запрос', 
      path: '/search', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )
    },
    { 
      name: 'Интересное', 
      path: '/explore', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
          <circle cx="12" cy="12" r="10" />
          <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
        </svg>
      )
    },
    { 
      name: 'Уведомления', 
      path: '/notifications', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    },
    { 
      name: 'Создать', 
      path: '/create', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      )
    },
    { 
      name: 'Профиль', 
      path: '/profile', 
      icon: (
        <div className="w-6 h-6 rounded-full border-2 border-current overflow-hidden">
          <img src={
              user?.avatar_url
                ? `http://localhost:8080${user.avatar_url}?t=${Date.now()}`
                : '/default-avatar.png'
            } className="w-full h-full object-cover" alt="" />
        </div>
      )
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-insta-dark flex flex-col p-4 z-50 transition-colors duration-300">
      <div className="mb-10 px-4 mt-4 h-10 flex items-center">
        <img 
          src={isDark ? iconDark : iconLight} 
          alt="Instagram"
          className="h-full object-contain cursor-pointer transition-opacity duration-300"
        />
      </div>

      <nav className="flex-1 space-y-2">
      {menuItems.map((item) => (
        <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-zinc-900 text-black dark:text-white ${
            location.pathname === item.path ? 'font-bold' : 'font-normal opacity-90'
            }`}
        >
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 transition-transform duration-200 active:scale-90">
            {item.icon}
            </div>

            <span className="text-base">{item.name}</span>
        </button>
        ))}
      </nav>

      <div className="mt-auto space-y-2 pb-4">
        <button 
            onClick={() => setIsDark(!isDark)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 text-black dark:text-white transition-colors group"
        >
            <div className="flex-shrink-0 transition-transform duration-200 group-active:scale-90">
            {isDark ? (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            )}
            </div>
            <span className="text-base">{isDark ? 'Светлая тема' : 'Темная тема'}</span>
        </button>
        </div>
    </div>
  );
};

export default Sidebar;