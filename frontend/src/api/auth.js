import axiosInstance from './axiosInstance';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export const login = (credentials) =>
  axios.post(`${API_BASE}/auth/login/`, credentials);

export const register = (data) =>
  axios.post(`${API_BASE}/auth/register/`, data);

export const refreshToken = (refresh) =>
  axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });

export const getProfile = () => axiosInstance.get('/profile/');

export const updateProfile = (data) => axiosInstance.patch('/profile/', data);
