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

const logout = () => {
    localStorage.removeItem('token');
};

const authService = {
    login,
    register,
    logout
};

export default authService;
