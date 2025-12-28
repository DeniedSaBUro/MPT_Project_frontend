import React, { useState, useEffect } from 'react';
import http from '../http-common';
import PostModal from '../components/PostModal';
import Sidebar from '../components/Sidebar';
import ExploreItem from './ExploreItem';

const ExplorePage = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const res = await http.get('/content/all'); 
        setPosts(res.data || []);
      } catch (err) {
        console.error("Ошибка при загрузке интересного", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPosts();
  }, []);

  if (loading) return <div className="flex justify-center mt-20 dark:text-white text-xl">Загрузка...</div>;

  return (
    <div className="flex min-h-screen bg-white dark:bg-insta-dark transition-colors duration-300">
      <Sidebar />
    
      <main className="flex-1 ml-64 flex justify-center py-8">
        <div className="w-full max-w-[935px]">
          
          {loading ? (
            <div className="flex justify-center mt-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {posts.map((post) => (
                <ExploreItem
                key={post.id} 
                post={post} 
                onClick={setSelectedPost} 
              />
                ))}
            </div>
          ) : (
            <div className="text-center mt-20 text-gray-500">
              Здесь пока ничего нет.
            </div>
          )}
        </div>
      </main>

      {selectedPost && (
        <PostModal 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}
    </div>
  );
};

export default ExplorePage;