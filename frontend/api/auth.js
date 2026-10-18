import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/auth/';

export const register = async (username, password, role) => {
    return axios.post(API_URL + 'register/', {
        username,
        password,
        role
    });
};

export const login = async (username, password) => {
    const response = await axios.post(API_URL + 'login/', { username, password });
    if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        // Save user role/name by decoding token or fetching profile in a real app
        localStorage.setItem('username', username);
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};