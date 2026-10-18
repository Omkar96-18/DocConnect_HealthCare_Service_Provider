import axiosInstance from './axiosInstance';

export const getConversations = () =>
  axiosInstance.get('/conversations/');

export const getConversation = (id) =>
  axiosInstance.get(`/conversations/${id}/`);

export const getMessages = (conversationId) =>
  axiosInstance.get(`/conversations/${conversationId}/messages/`);

export const sendMessage = (conversationId, content) =>
  axiosInstance.post(`/conversations/${conversationId}/messages/`, {
    content,
  });

export const startConversation = (doctorId) =>
  axiosInstance.post('/conversations/', {
    doctor: doctorId,
  });
