import http from '../http-common';

const getUserPosts = async (userId) => {
  try {
    const response = await http.get(`/content/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

const getFeedPosts = async () => {
  try {
    const response = await http.get('/content/feed');
    return response.data;
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    throw error;
  }
};

const deletePost = async (postId) => {
  try {
    const response = await http.delete(`/content/delete/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

const updatePost = async (postId, data) => {
  try {
    const response = await http.patch(`/content/update/${postId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

export default {
  getUserPosts,
  getFeedPosts,
  deletePost,
  updatePost
};