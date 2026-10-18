import axiosInstance from './axiosInstance';

export const getNotifications = () =>
  axiosInstance.get('/notifications/');

export const markNotificationRead = (id) =>
  axiosInstance.post(`/notifications/${id}/read/`);

export const markAllNotificationsRead = () =>
  axiosInstance.post('/notifications/read-all/');

export const getUnreadCount = () =>
  axiosInstance.get('/notifications/unread-count/');
