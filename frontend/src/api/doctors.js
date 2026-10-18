import axiosInstance from './axiosInstance';

export const getDoctors = (params) =>
  axiosInstance.get('/doctors/', { params });

export const getDoctor = (id) => axiosInstance.get(`/doctors/${id}/`);

export const getDoctorProfile = () => axiosInstance.get('/profile/doctor/');

export const updateDoctorProfile = (data) =>
  axiosInstance.patch('/profile/doctor/', data);

export const requestConsultation = (doctorId, data = {}) =>
  axiosInstance.post('/access/request/', { doctor_id: doctorId, ...data });

export const getPatients = () => axiosInstance.get('/access/list/');

export const getAccessList = () => axiosInstance.get('/access/list/');

export const grantAssistantPermission = (grant = true) =>
  axiosInstance.post('/access/grant-assistant-permission/', { grant });

export const revokeAssistantPermission = () =>
  axiosInstance.post('/access/grant-assistant-permission/', { grant: false });

export const approveAccess = (accessId, decision = 'approve') =>
  axiosInstance.post(`/access/approve/${accessId}/`, { decision });
