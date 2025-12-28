import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../services/auth.service';
import followService from '../services/follow.service';
import postService from '../services/post.service';
import PostModal from '../components/PostModal';
import http from '../http-common';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import ExploreItem from '../explore/ExploreItem';

const ProfilePage = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { username } = useParams();
  
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [followStatuses, setFollowStatuses] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  
  const loadPostsWithStats = async (postsList) => {
  try {
    if (!postsList || !Array.isArray(postsList)) {
      console.log('Posts list is empty or not an array:', postsList);
      return [];
    }
    
    if (postsList.length === 0) {
      return [];
    }
    
    const firstPost = postsList[0];
    if (!firstPost) {
      return postsList;
    }
    
    const hasLikesCount = 'likes_count' in firstPost || 'likes' in firstPost || 'like_count' in firstPost;
    const hasCommentsCount = 'comments_count' in firstPost || 'comments' in firstPost || 'comment_count' in firstPost;
    
    if (hasLikesCount && hasCommentsCount) {
      return postsList;
    }
    console.log('Loading stats for posts...');
    const postsWithStats = await Promise.all(
      postsList.map(async (post) => {
        if (!post || !post.id) {
          return post;
        }
        
        try {
          const [likesRes, commentsRes] = await Promise.all([
            http.get(`/likes/${post.id}`).catch(() => ({ data: 0 })),
            http.get(`/comment/content/${post.id}`).catch(() => ({ data: [] }))
          ]);
          
          return {
            ...post,
            likes_count: likesRes.data || 0,
            comments_count: Array.isArray(commentsRes.data) ? commentsRes.data.length : 0
          };
        } catch (error) {
          console.error(`Error loading stats for post ${post.id}:`, error);
          return {
            ...post,
            likes_count: 0,
            comments_count: 0
          };
        }
      })
    );
    
    return postsWithStats;
  } catch (error) {
    console.error('Error loading posts stats:', error);
    return postsList || [];
  }
};

  const loadUserPosts = async (userId) => {
    setIsLoadingPosts(true);
    try {
      const userPosts = await postService.getUserPosts(userId);
      console.log('Loaded posts:', userPosts);
      
      if (!userPosts) {
        setPosts([]);
        return;
      }
      
      const postsWithStats = await loadPostsWithStats(userPosts);
      setPosts(postsWithStats || []);
    } catch (error) {
      console.error('Error loading user posts:', error);
      toast.error('Ошибка загрузки постов');
      setPosts([]);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        let userData;
        
        if (username) {
          userData = await authService.getUserByUsername(username);
        } else if (currentUser) {
          userData = currentUser;
        }
        
        if (userData) {
          setProfileUser(userData);
          
          try {
            const stats = await followService.getFollowInfo(userData.id);
            setFollowStats({
              followers: stats.followers_count || 0,
              following: stats.following_count || 0
            });
          } catch (error) {
            console.error('Error loading follow stats:', error);
            setFollowStats({ followers: 0, following: 0 });
          }
          
          if (currentUser && currentUser.id !== userData.id) {
            try {
              const isFollowingStatus = await followService.checkFollow(userData.id);
              setIsFollowing(isFollowingStatus);
            } catch (error) {
              console.error('Error checking follow status:', error);
              setIsFollowing(false);
            }
          }
          
          await loadUserPosts(userData.id);
        }
      } catch (error) {
        toast.error('Ошибка загрузки профиля');
        console.error('Profile load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [username, currentUser]);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedPost(null);
  };

  const loadFollowers = async () => {
    try {
      const data = await followService.getFollowers(profileUser.id);
      setFollowers(data);
      
      if (currentUser) {
        const statuses = {};
        for (const person of data) {
          if (person.id !== currentUser.id) {
            try {
              const isFollowingPerson = await followService.checkFollow(person.id);
              statuses[person.id] = isFollowingPerson;
            } catch (error) {
              console.error(`Error checking follow for ${person.id}:`, error);
              statuses[person.id] = false;
            }
          }
        }
        setFollowStatuses(prev => ({ ...prev, ...statuses }));
      }
      
      setActiveModal('followers');
    } catch (error) {
      setFollowers([]);
      setActiveModal('followers');
    }
  };

  const loadFollowing = async () => {
    try {
      const data = await followService.getFollowing(profileUser.id);
      setFollowing(data);
      
      if (currentUser) {
        const statuses = {};
        for (const person of data) {
          if (person.id !== currentUser.id) {
            try {
              const isFollowingPerson = await followService.checkFollow(person.id);
              statuses[person.id] = isFollowingPerson;
            } catch (error) {
              console.error(`Error checking follow for ${person.id}:`, error);
              statuses[person.id] = false;
            }
          }
        }
        setFollowStatuses(prev => ({ ...prev, ...statuses }));
      }
      
      setActiveModal('following');
    } catch (error) {
      setFollowing([]);
      setActiveModal('following');
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.error('Для подписки необходимо авторизоваться');
      navigate('/login');
      return;
    }

    setIsLoadingFollow(true);
    try {
      if (isFollowing) {
        await followService.unfollow(profileUser.id);
        setIsFollowing(false);
        setFollowStats(prev => ({
          ...prev,
          followers: Math.max(0, prev.followers - 1)
        }));
        toast.success('Вы отписались');
      } else {
        await followService.follow(profileUser.id);
        setIsFollowing(true);
        setFollowStats(prev => ({
          ...prev,
          followers: prev.followers + 1
        }));
        toast.success('Вы подписались');
      }
    } catch (error) {
      toast.error('Ошибка при выполнении действия');
      console.error('Follow toggle error:', error);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleFollowInModal = async (personId, personUsername) => {
    if (!currentUser) {
      toast.error('Для подписки необходимо авторизоваться');
      return;
    }

    if (personId === currentUser.id) return;

    try {
      const isCurrentlyFollowing = followStatuses[personId] || false;

      if (isCurrentlyFollowing) {
        await followService.unfollow(personId);
        setFollowStatuses(prev => ({
          ...prev,
          [personId]: false
        }));
        toast.success(`Вы отписались от ${personUsername}`);
        if (profileUser.id !== currentUser.id){
          return
        }
        
        if (activeModal === 'following') {
          setFollowing(prev => prev.filter(person => person.id !== personId));
          setFollowStats(prev => ({
            ...prev,
            following: Math.max(0, prev.following - 1)
          }));
        }
        
      } else {
        await followService.follow(personId);
        setFollowStatuses(prev => ({
          ...prev,
          [personId]: true
        }));
        
        if (activeModal === 'followers') {
          setFollowStats(prev => ({
            ...prev,
            following: prev.following + 1
          }));
        }
        
        toast.success(`Вы подписались на ${personUsername}`);
      }
    } catch (error) {
      toast.error('Ошибка при выполнении действия');
      console.error('Follow in modal error:', error);
    }
  };

  const handleFollowToggleInModal = async (personId, personUsername) => {
    await handleFollowInModal(personId, personUsername);

    try {
      const updatedStats = await followService.getFollowInfo(profileUser.id);
      setFollowStats({
        followers: updatedStats.followers_count || 0,
        following: updatedStats.following_count || 0
      });
    } catch (error) {
      console.error('Error updating follow stats:', error);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const getLikesCount = (post) => {
    return post.likes_count || post.likes || post.like_count || 0;
  };

  const getCommentsCount = (post) => {
    return post.comments_count || post.comments || post.comment_count || 0;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-white dark:bg-insta-dark">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex min-h-screen bg-white dark:bg-insta-dark">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Пользователь не найден</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === profileUser.id;

  return (
    <div className="flex min-h-screen bg-white dark:bg-insta-dark">
      <Sidebar />
      
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
            <div className="flex-shrink-0">
              <img
                src={
                  profileUser?.avatar_url
                    ? `http://localhost:8080${profileUser.avatar_url}?t=${Date.now()}`
                    : '/default-avatar.png'
                }
                className="w-36 h-36 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-lg"
                alt={profileUser.username}
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-normal text-gray-900 dark:text-white mb-1 text-left">
                    {profileUser.username}
                  </h2>
                  {profileUser.full_name && (
                    <p className="text-gray-800 dark:text-gray-400 text-lg text-left">
                      {profileUser.full_name}
                    </p>
                  )}
                </div>
                
                {isOwnProfile && (
                  <div className="md:ml-auto">
                    <button
                      onClick={handleEditProfile}
                      className="bg-transparent border border-gray-300 dark:border-zinc-700 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                    >
                      Редактировать профиль
                    </button>
                  </div>
                )}
                {!isOwnProfile && currentUser && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleFollowToggle}
                    disabled={isLoadingFollow}
                    className={`px-6 py-2 rounded-lg transition-colors duration-200 text-sm ${isFollowing 
                      ? 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-600' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                  >
                    {isLoadingFollow ? 'Загрузка...' : (isFollowing ? 'Отписаться' : 'Подписаться')}
                  </button>
                </div>
              )}
              </div>

              <div className="flex gap-10 mb-4">
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {posts.length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    публикаций
                  </div>
                </div>
                
                <button 
                  onClick={loadFollowers}
                  className="text-center hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {followStats.followers}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    подписчиков
                  </div>
                </button>
                
                <button 
                  onClick={loadFollowing}
                  className="text-center hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="text-xl font-semibold text-gray-900 dark:text-white">
                    {followStats.following}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    подписок
                  </div>
                </button>
              </div>

              {profileUser.description && (
                <div className="mt-4 w-full max-w-full overflow-hidden">
                  <p className="text-gray-700 dark:text-gray-300 text-sm text-left break-all word-break-break-all overflow-wrap-break-word whitespace-normal">
                    {profileUser.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-zinc-700 my-6"></div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Публикации
            </h3>
            
            {isLoadingPosts ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post) => {
                  const likesCount = getLikesCount(post);
                  const commentsCount = getCommentsCount(post);
                  
                  return (
                    <ExploreItem
                      key={post.id} 
                      post={post} 
                      onClick={() => handlePostClick(post)} />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                  Здесь пока ничего нет
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  {isOwnProfile 
                    ? 'Создайте первую публикацию!' 
                    : 'Пользователь еще не создал публикаций'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

     {activeModal && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeModal();
          }
        }}
      >
        <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden">
          <div className="border-b border-gray-200 dark:border-zinc-700 p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeModal === 'followers' ? 'Подписчики' : 'Подписки'}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            {(activeModal === 'followers' ? followers : following).length > 0 ? (
              (activeModal === 'followers' ? followers : following).map((person) => {
                const isFollowingPerson = followStatuses[person.id] || false;
                
                return (
                  <div
                    key={person.id}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800 border-b border-gray-100 dark:border-zinc-800 last:border-b-0"
                  >
                    <img
                      src={
                        person.avatar_url
                          ? `http://localhost:8080${person.avatar_url}?t=${Date.now()}`
                          : '/default-avatar.png'
                      }
                      className="w-12 h-12 rounded-full object-cover"
                      alt={person.username}
                    />
                    <div 
                      className="flex-1 cursor-pointer hover:opacity-80"
                      onClick={() => {
                        closeModal();
                        navigate(`/profile/${person.username}`);
                      }}
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white text-left">
                        {person.username}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                        {person.full_name || 'Без имени'}
                      </p>
                    </div>
                    
                    {currentUser && person.id !== currentUser?.id && (
                      <button 
                        onClick={() => handleFollowToggleInModal(person.id, person.username)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                          isFollowingPerson
                            ? 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-600'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isFollowingPerson ? 'Отписаться' : 'Подписаться'}
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13-5.197a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-lg font-medium mb-2">
                  {activeModal === 'followers' ? 'Нет подписчиков' : 'Нет подписок'}
                </p>
                <p className="text-sm">
                  {activeModal === 'followers' 
                    ? 'Когда пользователя будут подписываться, они появятся здесь'
                    : 'Когда пользователь начнёт подписываться, они появятся здесь'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
      {isPostModalOpen && selectedPost && (
        <PostModal 
          post={selectedPost} 
          onClose={handleClosePostModal} 
        />
      )}
    </div>
  );
};

export default ProfilePage;