import React, { useEffect, useState } from 'react';
import http from '../http-common';
import { useNavigate } from 'react-router-dom';
import FollowButton from './FollowButton';

const NotificationsPanel = ({ isOpen, onClose, refreshTrigger }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postData, setPostData] = useState({});

  const navigate = useNavigate();

  const handleUserClick = (e, username) => {
    e.stopPropagation();
    onClose();
    navigate(`/profile/${username}`);
  };

  const handleNotificationClick = (n) => {
    if (n.Type !== 'FOLLOW' && n.TargetId) {
      const post = postData[n.TargetId]
      onClose();
      navigate(`/p/${n.TargetId}`);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (isOpen) {
      
      markAllAsRead();
    }
  }, [isOpen, refreshTrigger]);

  const fetchNotifications = async () => {
    try {
      const res = await http.get('/notifications');
      const notifs = res.data || []
      setNotifications(notifs);
      await fetchPostsForNotifications(notifs);
    } catch (err) {
      console.error("Ошибка загрузки уведомлений", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostsForNotifications = async (notifs) => {
    const postIds = [...new Set(
      notifs
        .filter(n => n.Type !== 'FOLLOW' && n.TargetId)
        .map(n => n.TargetId)
    )];

    try {
      const postRequests = postIds.map(id => 
        http.get(`/content/${id}`).catch(err => {
          console.error(`Ошибка загрузки поста ${id}`, err);
          return null;
        })
      );

      const responses = await Promise.all(postRequests);
      const newPostData = {};
      responses.forEach(res => {
        if (res && res.data) {
          newPostData[res.data.id] = res.data;
        }
      });

      setPostData(prev => ({ ...prev, ...newPostData }));
    } catch (err) {
      console.error("Ошибка при массовой загрузке постов", err);
    }
};

  const markAllAsRead = async () => {
    try {
      await http.patch('/notifications/read');
    } catch (err) {
      console.error("Ошибка при прочтении уведомлений", err);
    }
  };

  const groupNotifications = () => {
    const now = new Date();
    const today = notifications.filter(n => {
      const d = new Date(n.CreatedAt);
      return d.toDateString() === now.toDateString();
    });
    const thisMonth = notifications.filter(n => {
      const d = new Date(n.CreatedAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && d.toDateString() !== now.toDateString();
    });
    const earlier = notifications.filter(n => {
      const d = new Date(n.CreatedAt);
      return d.getFullYear() < now.getFullYear() || (d.getMonth() < now.getMonth() && d.getFullYear() === now.getFullYear());
    });

    return { today, thisMonth, earlier };
  };

  const groups = groupNotifications();

  const renderNotificationItem = (n) => {
    const targetPost = postData[n.TargetId];
    const postThumbnail = targetPost?.media_urls?.[0];
    return (
      <div key={n.ID} className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-zinc-900 px-4 transition-colors cursor-pointer"
        onClick={()=> handleNotificationClick(n)}
      >
        <div className="flex items-center gap-3">
          <img 
            src={n.author.avatar_url ? `http://localhost:8080${n.author.avatar_url}` : '/default-avatar.png'} 
            className="w-11 h-11 rounded-full object-cover cursor-pointer hover:opacity-80" 
            alt="" 
            onClick={(e)=>handleUserClick(e, n.author.username)}
          />
          <div className="text-sm dark:text-white text-left">
            <span className="font-semibold cursor-pointer hover:opacity-80" onClick={(e)=>handleUserClick(e, n.author.username)}>{n.author.username}</span>{' '}
            {n.Type === 'LIKE' && 'поставил(а) отметку "Нравится" вашей публикации.'}
            {n.Type === 'COMMENT' && 'прокомментировал(а) ваш пост'}
            {n.Type === 'FOLLOW' && 'подписался(-ась) на ваши обновления.'}
            {n.Type === 'RESPONSE' && 'ответил(а) на ваш комментарий'}
            <span className="text-gray-600 ml-2 text-xs">
              {new Date(n.CreatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {n.Type !== 'FOLLOW' && (
          <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0 ml-2">
            {postThumbnail ? (
              <img 
                src={`http://localhost:8080${postThumbnail}`} 
                className="w-full h-full object-cover" 
                alt="Post preview"
              />
            ) : (
              <div className="w-full h-full animate-pulse bg-zinc-700" />
            )}
          </div>
        )}
        
        {n.Type === 'FOLLOW' && (
          <FollowButton userId={n.author.id}/>
          )
        }
      </div>
    );
  }
    
  

  return (
    <div className={`fixed top-0 left-0 h-full bg-white dark:bg-black border-r border-gray-200 dark:border-zinc-800 z-[150] transition-all duration-300 shadow-2xl overflow-hidden
      ${isOpen ? 'w-[400px] left-[72px]' : 'w-0 -left-full'}`}>
      
      <div className="p-6">
        <h2 className="text-2xl font-bold dark:text-white mb-6">Уведомления</h2>
        
        <div className="overflow-y-auto h-[calc(100vh-100px)] -mx-4">
          {groups.today.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold px-4 mb-2 dark:text-white">Сегодня</h3>
              {groups.today.map(renderNotificationItem)}
            </div>
          )}

          {groups.thisMonth.length > 0 && (
            <div className="mb-6 border-t border-gray-100 dark:border-zinc-900 pt-4">
              <h3 className="font-semibold px-4 mb-2 dark:text-white">В этом месяце</h3>
              {groups.thisMonth.map(renderNotificationItem)}
            </div>
          )}

          {groups.earlier.length > 0 && (
            <div className="mb-6 border-t border-gray-100 dark:border-zinc-900 pt-4">
              <h3 className="font-semibold px-4 mb-2 dark:text-white">Ранее</h3>
              {groups.earlier.map(renderNotificationItem)}
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="text-center text-gray-500 mt-20 px-10">
              Здесь будут отображаться уведомления о лайках и комментариях.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;