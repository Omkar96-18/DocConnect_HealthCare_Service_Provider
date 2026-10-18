import axiosInstance from './axiosInstance';

export const getAppointments = (params) =>
  axiosInstance.get('/appointments/', { params });

export const getAppointment = (id) => axiosInstance.get(`/appointments/${id}/`);

export const createAppointment = (data) =>
  axiosInstance.post('/appointments/', data);

export const updateAppointment = (id, data) =>
  axiosInstance.patch(`/appointments/${id}/`, data);

export const cancelAppointment = (id) =>
  axiosInstance.post(`/appointments/${id}/cancel/`);

export const approveAppointment = (id) =>
  axiosInstance.post(`/appointments/${id}/approve/`);

export const rejectAppointment = (id) =>
  axiosInstance.post(`/appointments/${id}/reject/`);

export const completeAppointment = (id) =>
  axiosInstance.post(`/appointments/${id}/complete/`);
