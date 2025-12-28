import React, { useState, useEffect } from 'react';
import http from '../http-common';

const ExploreItem = ({ post, onClick }) => {
  const [stats, setStats] = useState({ likes: 0, comments: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [likesRes, commentsRes] = await Promise.all([
          http.get(`/likes/${post.id}`),
          http.get(`/comment/content/${post.id}`)
        ]);
        setStats({
          likes: likesRes.data,
          comments: commentsRes.data.length || 0
        });
      } catch (err) {
        console.error("Ошибка загрузки статистики поста", err);
      }
    };
    fetchStats();
  }, [post.id]);

  return (
    <div 
      onClick={() => onClick(post)}
      className="relative aspect-square cursor-pointer group overflow-hidden bg-gray-100 dark:bg-zinc-900"
    >
      <img 
        src={`http://localhost:8080${post.media_urls[0]}`} 
        className="w-full h-full object-cover transition duration-300 group-hover:brightness-50"
        onError={(e) => { e.target.src = 'https://placehold.co/600x600?text=No+Image'; }}
      />
      
      <div className="absolute inset-0 flex items-center justify-center gap-8 opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold pointer-events-none z-20">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>{stats.likes}</span>
        </div>

        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M20.656 17.008a9.993 9.993 0 10-3.59 3.615L22 22z" />
          </svg>
          <span>{stats.comments}</span>
        </div>
      </div>

      {post.media_urls?.length > 1 && (
        <div className="absolute top-2 right-2 text-white z-10">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shadow-black drop-shadow-sm">
            <path d="M19 15V5c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2zm-2 0H7V5h10v10zm4-8v12c0 1.1-.9 2-2 2H5v-2h14V7h2z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ExploreItem;