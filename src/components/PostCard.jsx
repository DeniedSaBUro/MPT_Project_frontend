import React, { useState, useEffect } from 'react';
import http from '../http-common';
import PostModal from './PostModal';
import PostOptions from './PostOptions';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post }) => {
  const { user, setUser, logout } = useAuth();

  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const hasMultipleMedia = post.media_urls?.length > 1;
  const description = post.description || '';
  const isLongDescription = description.length > 50;

  const [commentCount, setCommentCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countRes, statusRes, commentRes] = await Promise.all([
          http.get(`/likes/${post.id}`),
          http.get(`/liked/${post.id}`),
          http.get(`/comment/content/${post.id}`),
        ]);
        setLikesCount(countRes.data);
        setLiked(statusRes.data);
        setCommentCount(commentRes.data?.length || 0)
      } catch (err) {
        console.error("Ошибка загрузки данных лайков", err);
      }
    };
    fetchData();
  }, [post.id]);

  const handleLikeToggle = async () => {
    try {
      if (liked) {
        await http.delete(`/unlike/${post.id}`);
        setLikesCount(prev => prev - 1);
        setLiked(false);
      } else {
        await http.post(`/like/${post.id}`);
        setLikesCount(prev => prev + 1);
        setLiked(true);
      }
    } catch (err) {
      toast.error("Не удалось выполнить действие");
    }
  };

  return (
    <>
      <div className="w-full max-w-[470px] mx-auto mb-8 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-700">
              <img
                src={post.author.avatar_url 
                  ? `http://localhost:8080${post.author.avatar_url}?t=${Date.now()}`  
                  : '/default-avatar.png'}
                className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                alt="avatar"
                onClick={() => navigate(`/profile/${post.author.username}`)}
              />
            </div>
            <span className="text-sm font-semibold dark:text-white cursor-pointer hover:opacity-80" onClick={() => navigate(`/profile/${post.author.username}`)}>
              {post.author.username}
            </span>
            <span className="text-gray-500 text-sm">• 4 ч.</span>
          </div>
          <PostOptions post={post} currentUser={user}/>
        </div>

        <div className="relative w-full aspect-square bg-black rounded-[4px] overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-800">
          {post.media_urls?.length > 0 ? (
            <>
              <img
                src={`http://localhost:8080${post.media_urls[currentMediaIdx]}`}
                className="w-full h-full object-contain"
                alt="post content"
              />
              {hasMultipleMedia && (
                <>
                  <button 
                    onClick={() => setCurrentMediaIdx(prev => (prev - 1 + post.media_urls.length) % post.media_urls.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-black w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md z-10"
                  >
                    ❮
                  </button>
                  <button 
                    onClick={() => setCurrentMediaIdx(prev => (prev + 1) % post.media_urls.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-black w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md z-10"
                  >
                    ❯
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {post.media_urls.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentMediaIdx ? 'bg-white' : 'bg-white/40'}`} 
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-white text-sm">Медиа отсутствуют</div>
          )}
        </div>

        <div className="pt-3">
          <div className="flex items-center justify-between mb-3 text-2xl dark:text-white">
            <div className="flex gap-4">
              <button 
                onClick={handleLikeToggle}
                className={`transition-transform active:scale-125 duration-100 ${liked ? 'text-red-500' : 'dark:text-white'}`}
              >
                {liked ? (
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current stroke-2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="w-full text-left">
            <div className="font-semibold text-sm mb-2 dark:text-white cursor-pointer">
              {likesCount} отметок "Нравится"
            </div>
            <div className="text-sm dark:text-white mb-1 leading-snug">
              <span className="font-semibold mr-2 cursor-pointer hover:opacity-80" onClick={() => navigate(`/profile/${post.author.username}`)}>
                {post.author.username}
              </span>
              <span className="dark:text-gray-100">
                {isExpanded || !isLongDescription 
                  ? description 
                  : `${description.substring(0, 50)}...`}
              </span>
              {isLongDescription && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-500 ml-1 hover:text-gray-900 dark:hover:text-gray-300 text-sm"
                >
                  {isExpanded ? 'скрыть' : 'ещё'}
                </button>
              )}
            </div>

            <button className="text-gray-500 text-sm mb-1 cursor-pointer hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
              onClick={() => setIsModalOpen(true)}
            >
              Посмотреть все комментарии ({commentCount})
            </button>

            <div className="text-[10px] text-gray-400 uppercase tracking-wide">
              {new Date(post.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
            <PostModal 
              post={post} 
              onClose={() => setIsModalOpen(false)} 
            />
          )}
    </>
    
  );
};
  
  export default PostCard