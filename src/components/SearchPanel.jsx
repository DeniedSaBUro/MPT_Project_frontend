import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';

const SearchPanel = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const useDebounce = (callback, delay) => {
    const timeoutRef = React.useRef(null);

    return useCallback((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }, [callback, delay]);
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const users = await authService.searchUsers(query);
      const currentUser = JSON.parse(localStorage.getItem('user'));
      
      let filteredUsers = users || [];
      if (currentUser) {
        filteredUsers = filteredUsers.filter(user => 
          user.id !== currentUser.id
        );
      }
      
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useDebounce(searchUsers, 300);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleUserClick = (username) => {
    onClose();
    navigate(`/profile/${username}`);
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen]);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  const renderSearchResult = (user) => {
    return (
      <div
        key={user.id}
        className="flex items-center py-3 hover:bg-gray-50 dark:hover:bg-zinc-900 px-4 transition-colors cursor-pointer"
        onClick={() => handleUserClick(user.username)}
      >
        <div className="flex items-center gap-3">
          <img 
            src={
              user.avatar_url 
                ? `http://localhost:8080${user.avatar_url}` 
                : '/default-avatar.png'
            } 
            className="w-11 h-11 rounded-full object-cover" 
            alt={user.username}
          />
          <div className="text-sm dark:text-white text-left">
            <div className="font-semibold">{user.username}</div>
            {user.full_name && (
              <div className="text-gray-600 dark:text-gray-400 text-xs">
                {user.full_name}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed top-0 left-0 h-full bg-white dark:bg-black border-r border-gray-200 dark:border-zinc-800 z-[150] transition-all duration-300 shadow-2xl overflow-hidden
      ${isOpen ? 'w-[400px] left-[72px]' : 'w-0 -left-full'}`}>
      
      <div className="p-6">
        <h2 className="text-2xl font-bold dark:text-white mb-6">Поиск пользователей</h2>
        <div className="relative mb-6">
          <svg 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Введите имя пользователя..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-zinc-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="off"
          />
        </div>
        <div className="overflow-y-auto h-[calc(100vh-180px)] -mx-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Поиск...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              <h3 className="font-semibold px-4 mb-2 dark:text-white">
                Найдено {searchResults.length} пользователей
              </h3>
              {searchResults.map(renderSearchResult)}
            </div>
          ) : searchQuery.trim() ? (
            <div className="text-center py-20 px-10">
              <svg 
                className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-lg font-medium mb-2 dark:text-gray-400">
                {currentUser ? "Не найдено других пользователей" : "Пользователи не найдены"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {currentUser ? "Попробуйте другой запрос" : "Попробуйте изменить запрос поиска"}
              </p>
            </div>
          ) : (
            <div className="text-center py-20 px-10">
              <svg 
                className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-lg font-medium mb-2 dark:text-gray-400">Начните поиск</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Введите имя пользователя для поиска
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;