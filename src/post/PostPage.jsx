import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import http from '../http-common';
import { useAuth } from '../context/AuthContext';
import PostOptions from '../components/PostOptions';
import Sidebar from '../components/Sidebar';

const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await http.get(`/content/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error("Пост не найден", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const { user, setUser, logout } = useAuth();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState([]);
  
  const findRootId = (commentId, allComments) => {
    const current = allComments.find(c => c.id === commentId);
    if (!current || !current.parent_id) {
        return commentId;
    }
    return findRootId(current.parent_id, allComments);
  };

  const toggleExpand = (rootId) => {
    if (expandedComments.includes(rootId)) {
      setExpandedComments(expandedComments.filter(id => id !== rootId));
    } else {
      setExpandedComments([...expandedComments, rootId]);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await http.get(`/comment/content/${post.id}`);
      setComments(res.data || []);
    } catch (err) {
      console.error("Ошибка при обновлении комментариев", err);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    if (!post) return;
    const fetchData = async () => {
        try {
          const [countRes, statusRes] = await Promise.all([
            http.get(`/likes/${post.id}`),
            http.get(`/liked/${post.id}`),
          ]);
          setLikesCount(countRes.data);
          setLiked(statusRes.data);
        } catch (err) {
          console.error("Ошибка загрузки данных лайков", err);
        }
      };
    fetchData();
    fetchComments();

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [post?.id]);

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await http.post('/comment', {
        content_id: post.id,
        text: commentText,
        parent_id: replyTo ? replyTo.id : null
      });
      
      setCommentText('');
      setReplyTo(null);
      await fetchComments();

    } catch (err) {
      toast.error("Не удалось отправить комментарий");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await http.delete(`/comment/delete/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      toast.error("Ошибка при удалении");
    }
  };

  const handleReplyInitiation = (comment) => {
    setReplyTo({ id: comment.id, username: comment.author.username });
    setCommentText(`@${comment.author.username} `);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCommentText(value);
  
    if (value.trim() === '') {
      setReplyTo(null);
    }
  };

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

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>;
  if (!post) return <div className="text-center mt-20 dark:text-white">Пост не найден</div>;

  return (
    <div className="flex min-h-screen bg-white dark:bg-insta-dark transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 ml-64 flex justify-center py-8">
        <div className="w-full px-4">
            <div className="flex flex-col md:flex-row w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-slate-300 border border-grey dark:border-slate-800">
                <div className="flex-[1.5] bg-white flex items-center justify-center relative dark:bg-insta-dark border-r dark:border-slate-800">
                        {post.media_urls?.length > 0 ? (
                        <img
                            src={`http://localhost:8080${post.media_urls[currentMediaIdx]}`}
                            className="w-full h-full object-contain"
                            alt="post content"
                        />
                        ) : (
                        <div className="text-white">Медиа отсутствуют</div>
                        )}
                        {post.media_urls?.length > 1 && (
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
                </div>

                <div className="flex-1 flex flex-col bg-white dark:bg-insta-dark min-w-[350px]">
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                        <div className="flex items-center gap-3 ">
                            <img 
                            src={post.author.avatar_url ? `http://localhost:8080${post.author.avatar_url}?t=${Date.now()}` : '/default-avatar.png'} 
                            className="w-9 h-9 rounded-full object-cover cursor-pointer hover:opacity-80 flex-shrink-0" 
                            alt="avatar"
                            onClick={() => navigate(`/profile/${post.author.username}`)}
                            />
                            <span className="font-semibold text-sm dark:text-white cursor-pointer hover:opacity-80" onClick={() => navigate(`/profile/${post.author.username}`)}>{post.author.username}</span>
                        </div>
                        <PostOptions post={post} currentUser={user}/>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                        <div className="text-gray-500 text-sm text-center">
                            <div className="flex gap-3 pb-4">
                                <img src={post.author.avatar_url ? `http://localhost:8080${post.author.avatar_url}?t=${Date.now()}` : '/default-avatar.png'} className="w-9 h-9 rounded-full object-cover cursor-pointer hover:opacity-80 flex-shrink-0" alt="" onClick={() => navigate(`/profile/${post.author.username}`)}/>
                                <div className="text-sm text-left">
                                <span className="font-semibold mr-2 dark:text-white cursor-pointer hover:opacity-80" onClick={() => navigate(`/profile/${post.author.username}`)}>{post.author.username}</span>
                                <span className="dark:text-gray-200">{post.description}</span>
                                <div className="text-xs text-gray-500 mt-1">{new Date(post.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                            {comments
                            .filter(c => !c.parent_id) 
                            .map((rootComment) => {
                            const allNestedReplies = comments.filter(reply => 
                                reply.parent_id && findRootId(reply.id, comments) === rootComment.id
                            );
                            const isExpanded = expandedComments.includes(rootComment.id)
                            return (
                                <div key={rootComment.id} className="space-y-4 border-l-0 border-gray-100 dark:border-zinc-800">
                                    <div className="flex gap-3 group text-left">
                                        <img 
                                        src={rootComment.author.avatar_url ? `http://localhost:8080${rootComment.author.avatar_url}?t=${Date.now()}` : '/default-avatar.png'} 
                                        className="w-9 h-9 rounded-full object-cover cursor-pointer hover:opacity-80 flex-shrink-0" 
                                        alt="" 
                                        onClick={() => navigate(`/profile/${rootComment.author.username}`)}
                                        />
                                        <div className="text-sm flex-1">
                                            <span className="font-semibold mr-2 dark:text-white cursor-pointer hover:opacity-80" onClick={() => navigate(`/profile/${rootComment.author.username}`)}>{rootComment.author.username}</span>
                                            <span className="dark:text-gray-200">{rootComment.text}</span>
                                            <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                                <span>{new Date(rootComment.created_at).toLocaleDateString()}</span>
                                                <button onClick={() => handleReplyInitiation(rootComment)} className="font-semibold hover:text-gray-300">Ответить</button>
                                            </div>
                                        </div>
                                        {rootComment.author.id === user.id && (
                                        <button 
                                            onClick={() => handleDeleteComment(rootComment.id)}
                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity ml-2"
                                            title="Удалить"
                                        >
                                            ✕
                                        </button>
                                        )}
                                    </div>

                                    {isExpanded && allNestedReplies.map((reply) => (
                                    <div key={reply.id} className="flex gap-3 ml-11 group text-left">
                                        <img 
                                            src={reply.author.avatar_url ? `http://localhost:8080${reply.author.avatar_url}?t=${Date.now()}` : '/default-avatar.png'} 
                                            className="w-9 h-9 rounded-full object-cover cursor-pointer hover:opacity-80 flex-shrink-0" 
                                            alt="" 
                                            onClick={() => navigate(`/profile/${reply.author.username}`)}
                                        />
                                        <div className="text-sm flex-1">
                                            <span className="font-semibold mr-2 dark:text-white cursor-pointer hover:opacity-80" onClick={() => navigate(`/profile/${reply.author.username}`)}>{reply.author.username}</span>
                                            <span className="dark:text-gray-200">{reply.text}</span>
                                            <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                            <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                                            <button onClick={() => handleReplyInitiation(reply)} className="font-semibold hover:text-gray-300">Ответить</button>
                                            </div>
                                        </div>
                                        {reply.author.id === user.id && (
                                        <button 
                                            onClick={() => handleDeleteComment(reply.id)}
                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity ml-2"
                                            title="Удалить"
                                        >
                                            ✕
                                        </button>
                                        )}
                                    </div>
                                    
                                    ))}

                                    {allNestedReplies.length > 0 && (
                                    <div className="ml-11">
                                        <button 
                                        onClick={() => toggleExpand(rootComment.id)}
                                        className="flex items-center gap-2 text-xs text-gray-500 font-semibold hover:text-gray-400 transition-colors"
                                        >
                                        <span className="w-6 border-t border-gray-300 dark:border-zinc-700"></span>
                                        {isExpanded ? (
                                            `Скрыть ответы`
                                        ) : (
                                            `Посмотреть ответы (${allNestedReplies.length})`
                                        )}
                                        </button>
                                    </div>
                                    )}
                                    <div> 
                                    {/* Для отступа после всех ответов*/}
                                    </div>
                                </div>
                            );
                            })}
                        </div>
                        </div>

                        <div className="p-4 text-left">
                        <div className="flex gap-4 mb-2">
                            <button 
                            onClick={handleLikeToggle}
                            className={`${liked ? 'text-red-500' : 'dark:text-white'} transition-transform active:scale-125`}
                            >
                            <svg viewBox="0 0 24 24" className={`w-7 h-7 ${liked ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}>
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            </button>
                            
                        </div>
                        <div className="font-semibold text-sm dark:text-white">{likesCount} отметок "Нравится"</div>
                        
                        <div className="text-[10px] text-gray-400 uppercase mt-1">{new Date(post.created_at).toLocaleDateString()}</div>
                        </div>

                        <form onSubmit={handleSendComment} className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center gap-3">
                            
                            <input 
                            type="text" 
                            value={commentText}
                            onChange={handleInputChange}
                            placeholder="Добавьте комментарий..." 
                            className="flex-1 bg-transparent text-sm focus:outline-none dark:text-white"
                            />
                            <button 
                            type="submit"
                            disabled={!commentText.trim() || isSubmitting}
                            className="text-blue-500 font-semibold text-sm disabled:opacity-50"
                            >
                            {isSubmitting ? '...' : 'Опубликовать'}
                            </button>
                        </form>
                </div>        
            </div>
        </div>
      </main>
    </div>
    
  );
};

export default PostPage;