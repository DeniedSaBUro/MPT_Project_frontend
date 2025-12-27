import http from "../http-common";

const login = async (username, password) => {
    const data = {
        username: username,
        password: password
    };
    const response = await http.post("/users/login", data);
    if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
};

const register = async (userData) => {
    const data = {
        username: userData.username,
        password: userData.password
    };
    const response = await http.post("/users/register", data);
    return response.data;
};

const getProfile = async () => {
    console.log('GET /users/me');
    const response = await http.get('/users/me');
    console.log('PROFILE RESPONSE:', response.data);
    return response.data;
};

const logout = () => {
    localStorage.removeItem('token');
};

const updateProfile = async (data) => {
  const payload = {};
  if (data.username !== undefined) payload.username = data.username;
  if (data.fullName !== undefined) payload.full_name = data.fullName;
  if (data.description !== undefined) payload.description = data.description;

  return await http.patch('/users/update', payload);
};

const changePassword = async(oldPassword, newPassword) =>{
    await http.patch('/users/setPassword', {
        old_password: oldPassword,
        new_password: newPassword
    });
};

const uploadAvatar = async (file) =>{
    const formData = new FormData();
    formData.append('file', file);
    const response = await http.post('/users/setAvatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data
}
const authService = {
    login,
    register,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar
};

export default authService;
