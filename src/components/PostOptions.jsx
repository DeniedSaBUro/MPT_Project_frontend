import React, { useState } from 'react';
import UpdatePostModal from './UpdatePostModal';
import toast from 'react-hot-toast';
import http from '../http-common';

const PostOptions = ({ post, currentUser }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = currentUser && post.author && currentUser.id === post.author.id;

  const handleDelete = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить эту публикацию?")) return;

    setIsDeleting(true);
    try {
      await http.delete(`/content/delete/${post.id}`);
      toast.success("Публикация удалена");
      
      setIsMenuOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Ошибка при удалении поста:", err);
      toast.error(err.response?.data?.message || "Не удалось удалить пост");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current dark:text-white">
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="6" cy="12" r="1.5" />
          <circle cx="18" cy="12" r="1.5" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsMenuOpen(false)} />
          
          <div className="relative bg-white dark:bg-[#262626] w-full max-w-[400px] rounded-xl overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col">
              {isOwner ? (
                <>
                  <button 
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="py-3 px-4 text-sm font-bold text-red-500 border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {isDeleting ? "Удаление..." : "Удалить"}
                  </button>
                  <button 
                    onClick={() => {
                      setIsUpdateModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="py-3 px-4 text-sm font-semibold border-b border-gray-200 dark:border-zinc-700 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Редактировать
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    toast.success("Жалоба отправлена");
                    setIsMenuOpen(false);
                  }}
                  className="py-3 px-4 text-sm font-bold text-red-500 border-b border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Пожаловаться
                </button>
              )}
              
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="py-3 px-4 text-sm dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {isUpdateModalOpen && (
        <UpdatePostModal 
          post={post} 
          onClose={() => setIsUpdateModalOpen(false)} 
          onPostUpdated={() => window.location.reload()}
        />
      )}
    </div>
  );
};

export default PostOptions;