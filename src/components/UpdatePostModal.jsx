import React, { useState } from 'react';
import http from '../http-common';
import toast from 'react-hot-toast';

const UpdatePostModal = ({ post, onClose, onPostUpdated }) => {
  const [description, setDescription] = useState(post.description || '');
  const [currentMedia, setCurrentMedia] = useState(post.media_urls || []);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleRemoveMedia = (index) => {
    if (currentMedia.length <= 1) {
      toast.error("Нельзя удалить все фотографии. В публикации должно быть минимум одно фото.");
      return;
    }
    setCurrentMedia(currentMedia.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await http.patch(`/content/update/${post.id}`, {
        description: description,
        media_urls: currentMedia
      });

      toast.success("Публикация успешно обновлена");
      if (onPostUpdated) onPostUpdated();
      onClose();
    } catch (err) {
      console.error("Ошибка обновления:", err);
      toast.error(err.response?.data?.message || "Не удалось обновить пост");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      
      <div className={`relative bg-white dark:bg-[#262626] rounded-xl overflow-hidden flex flex-col transition-all duration-300 
        ${step === 1 ? 'w-full max-w-[500px] h-[550px]' : 'w-full max-w-[850px] h-[550px]'}`}>
        
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-zinc-700">
          <button onClick={onClose} className="dark:text-white hover:opacity-70">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <h2 className="font-semibold text-sm dark:text-white">Редактировать информацию</h2>
          <button 
            onClick={step === 1 ? () => setStep(2) : handleUpdate}
            disabled={loading}
            className="text-blue-500 font-bold text-sm hover:text-white disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : step === 1 ? 'Далее' : 'Готово'}
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className={`p-4 overflow-y-auto bg-zinc-50 dark:bg-black ${step === 2 ? 'w-3/5 border-r border-zinc-700' : 'w-full'}`}>
            <p className="text-xs text-gray-500 mb-4 text-center italic">Удалите лишние фото, нажав на крестик</p>
            <div className="grid grid-cols-2 gap-4">
              {currentMedia.map((url, idx) => (
                <div key={idx} className="relative aspect-square group">
                  <img 
                    src={`http://localhost:8080${url}`} 
                    className="w-full h-full object-cover rounded-md border border-zinc-800" 
                    alt="" 
                  />
                  <button 
                    onClick={() => handleRemoveMedia(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors"
                    title="Удалить это фото"
                  >
                    <span className="text-sm">✕</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {step === 2 && (
            <div className="w-2/5 flex flex-col bg-white dark:bg-black">
              <div className="p-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
                   {post.author?.avatar_url && <img src={`http://localhost:8080${post.author.avatar_url}`} className="w-full h-full object-cover" />}
                </div>
                <span className="font-semibold text-sm dark:text-white">{post.author?.username}</span>
              </div>
              <textarea 
                className="flex-1 w-full p-4 bg-transparent dark:text-white outline-none resize-none text-sm placeholder-gray-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Измените подпись к публикации..."
              />
              <div className="p-3 flex justify-end text-gray-500 text-[10px] border-t border-zinc-800">
                <span>{description.length} / 2,200</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatePostModal;