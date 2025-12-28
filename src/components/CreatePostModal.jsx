import React, { useState, useRef } from 'react';
import http from '../http-common';
import toast from 'react-hot-toast';

const CreatePostModal = ({user, onClose, onPostCreated }) => {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setFiles(prev => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (files.length === 0) return;
    setIsSubmitting(true);

    try {
      const postRes = await http.post('/content/create', { description });
      const postId = postRes.data
      console.log(postRes.data)

      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      await http.post(`/content/media/${postId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Публикация создана успешно!");
      onPostCreated();
      onClose();
    } catch (err) {
      toast.error("Ошибка при создании публикации");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className={`relative bg-white dark:bg-[#262626] rounded-xl overflow-hidden flex flex-col transition-all duration-300 
        ${step === 1 ? 'w-full max-w-[500px] h-[500px]' : 'w-full max-w-[800px] h-[500px]'}`}>
        
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-zinc-700">
          <button onClick={step === 2 ? () => setStep(1) : onClose} className="text-black dark:text-white">
            {step === 2 ? (
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            )}
          </button>
          <h2 className="font-semibold text-sm dark:text-white">Создание публикации</h2>
          {files.length > 0 && (
            <button 
              onClick={step === 1 ? () => setStep(2) : handlePublish}
              disabled={isSubmitting}
              className="text-blue-500 font-bold text-sm hover:text-blue-400 disabled:opacity-50"
            >
              {isSubmitting ? 'Загрузка...' : step === 1 ? 'Далее' : 'Поделиться'}
            </button>
          )}
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className={`relative flex items-center justify-center bg-zinc-50 dark:bg-black ${step === 2 ? 'w-[60%]' : 'w-full'}`}>
            {files.length === 0 ? (
              <div className="text-center p-6">
                <svg viewBox="0 0 24 24" className="w-20 h-20 mx-auto mb-4 text-gray-400 dark:text-white stroke-1 fill-none stroke-current">
                   <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                   <circle cx="8.5" cy="8.5" r="1.5"/>
                   <path d="M21 15l-5-5L5 21"/>
                </svg>
                <p className="text-xl dark:text-white mb-6">Перетащите сюда фото и видео</p>
                <input type="file" hidden ref={fileInputRef} multiple accept="image/*" onChange={handleFileSelect} />
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                >
                  Выбрать на компьютере
                </button>
              </div>
            ) : (
              <div className="w-full h-full relative group">
                <img src={previews[0]} className="w-full h-full object-cover" alt="preview" />
                
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto p-2 bg-black/20 rounded-lg">
                  {previews.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 flex-shrink-0">
                      <img src={url} className="w-full h-full object-cover rounded shadow" alt="" />
                      <button 
                        onClick={() => removeFile(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center shadow-lg"
                      >✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {step === 2 && (
            <div className="w-[40%] flex flex-col bg-white dark:bg-black border-l border-gray-200 dark:border-zinc-700">
              <div className="p-4 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full border-2 border-current overflow-hidden">
                <img src={
                    user?.avatar_url
                        ? `http://localhost:8080${user.avatar_url}?t=${Date.now()}`
                        : '/default-avatar.png'
                    } className="w-full h-full object-cover" alt="" />
                </div>
                <span className="font-semibold text-sm dark:text-white">{user?.username}</span>
              </div>
              <textarea
                placeholder="Добавьте подпись..."
                className="flex-1 w-full p-4 bg-transparent dark:text-white resize-none outline-none text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="p-3 flex justify-between text-gray-400 text-xs border-t border-gray-100 dark:border-zinc-800">
                <button>☺</button>
                <span>{description.length} / 2,200</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;