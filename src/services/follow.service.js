import http from '../http-common';

const followService = {
  follow: async (userId) => {
    const response = await http.post(`/follow/${userId}`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  unfollow: async (userId) => {
    const response = await http.delete(`/unfollow/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  checkFollow: async (followerId, followingId) => {
    const response = await http.get(`/follower/${followingId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  getFollowers: async (userId) => {
    const response = await http.get(`/followers/${userId}`);
    return response.data;
  },

  getFollowing: async (userId) => {
    const response = await http.get(`/following/${userId}`);
    return response.data;
  },

  getFollowInfo: async (userId) => {
    const response = await http.get(`/follow/info/${userId}`);
    return response.data;
  }
};

export default followService;