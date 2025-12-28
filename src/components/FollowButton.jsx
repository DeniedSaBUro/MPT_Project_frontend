import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import followService from '../services/follow.service';

const FollowButton = ({ userId }) => {
  const [isFollowed, setIsFollowed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await followService.checkFollow(userId);
        setIsFollowed(status === true || status?.is_following);
      } catch (err) {
        console.error("Ошибка проверки подписки:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [userId]);

  const handleAction = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      if (isFollowed) {
        await followService.unfollow(userId);
        setIsFollowed(false);
        toast.success("Вы отписались");
      } else {
        await followService.follow(userId);
        setIsFollowed(true);
        toast.success("Вы подписались");
      }
    } catch (err) {
      toast.error("Ошибка выполнения действия");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isFollowed) {
    return <div className="w-24 h-8 bg-zinc-800 animate-pulse rounded-lg" />;
  }

  if (isFollowed) {
    return (
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleAction}
        disabled={loading}
        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors w-[120px] ${
          isHovered 
            ? 'bg-red-500 text-white' 
            : 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white'
        }`}
      >
        {loading ? '...' : isHovered ? 'Отписаться' : 'Подписки'}
      </button>
    );
  }

  return (
    <button
      onClick={handleAction}
      disabled={loading}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors w-[120px]"
    >
      {loading ? '...' : 'Подписаться'}
    </button>
  );
};

export default FollowButton;