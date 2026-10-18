import axiosInstance from './axiosInstance';

export const getAdminStats = () => axiosInstance.get('/admin/stats/');

export const getMedicalCenters = () =>
  axiosInstance.get('/admin/medical-centers/');

export const createMedicalCenter = (data) =>
  axiosInstance.post('/admin/medical-centers/', data);

export const updateMedicalCenter = (id, data) =>
  axiosInstance.patch(`/admin/medical-centers/${id}/`, data);

export const deleteMedicalCenter = (id) =>
  axiosInstance.delete(`/admin/medical-centers/${id}/`);

export const getUsers = (params) =>
  axiosInstance.get('/admin/users/', { params });

export const getUser = (id) => axiosInstance.get(`/admin/users/${id}/`);
