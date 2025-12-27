import React, { useState, useEffect } from 'react';

const PostCard = ({ post }) => {
    const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
  
    const hasMultipleMedia = post.media_urls?.length > 1;
    const description = post.description || '';
    const isLongDescription = description.length > 50;
  
    const nextMedia = () => {
      setCurrentMediaIdx((prev) => (prev + 1) % post.media_urls.length);
    };
  
    const prevMedia = () => {
      setCurrentMediaIdx((prev) => (prev - 1 + post.media_urls.length) % post.media_urls.length);
    };
  
    const likesCount = post.likes_count || 0; 
  const commentsCount = post.comments_count || 0;

  return (
    <div className="w-full max-w-[470px] mx-auto mb-8 border-b border-gray-200 dark:border-insta-border pb-5">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-zinc-700">
            <img
              src={post.author.avatar_url 
                ? `http://localhost:8080${post.author.avatar_url}` 
                : '/default-avatar.png'}
              className="w-full h-full object-cover"
              alt="avatar"
            />
          </div>
          <span className="text-sm font-semibold dark:text-white hover:opacity-80 transition">
            {post.author.username}
          </span>
          <span className="text-gray-500 text-sm">• 4 ч.</span>
        </div>
        <button className="font-bold text-lg dark:text-white hover:opacity-60">•••</button>
      </div>

      <div className="relative w-full aspect-square bg-black rounded-[4px] overflow-hidden flex items-center justify-center border border-gray-200 dark:border-insta-border">
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
            <button className="hover:opacity-60 transition">
              <svg aria-label="Нравится" className="w-6 h-6 fill-transparent stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.956-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938Z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="w-full text-left">
          <div className="font-semibold text-sm mb-2 dark:text-white cursor-pointer">
            {likesCount} отметок "Нравится"
          </div>
          <div className="text-sm dark:text-white mb-1 leading-snug">
            <span className="font-semibold mr-2 cursor-pointer hover:opacity-80">
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

          <button className="text-gray-500 text-sm mb-1 cursor-pointer hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
            Посмотреть все комментарии ({commentsCount})
          </button>

          <div className="text-[10px] text-gray-400 uppercase tracking-wide">
            {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};
  
  export default PostCard