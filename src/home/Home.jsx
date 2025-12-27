import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import http from '../http-common';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';


const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get('/content/subscriptions')
      .then(response => {
        setPosts(response.data || []);
      })
      .catch(err => {
        if (err.response?.status !== 401) {
          toast.error('Ошибка при загрузке ленты');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-white dark:bg-insta-dark transition-colors duration-300">
      <Sidebar />

      <main className="flex-1 ml-64 flex justify-center py-8">
        <div className="w-full max-w-[630px] px-4">
          {loading ? (
            <div className="flex justify-center mt-20">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : posts.length > 0 ? (
            posts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center mt-20 text-gray-500">
              Лента пуста. Подпишитесь на кого-нибудь.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;