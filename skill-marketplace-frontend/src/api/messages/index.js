import { get, post } from '../utils';

export const getConversations = () => {
  return get('/conversations');
};

export const getMessages = (conversationId) => {
  return get(`/conversations/${conversationId}`);
};

export const sendMessage = (conversationId, data) => {
  return post(`/conversations/${conversationId}/messages`, data);
};

export const createConversation = (data) => {
  return post('/conversations', data);
};

export const getUnreadCount = () => {
  return get('/conversations/unread-count');
};

export const markAsRead = (conversationId) => {
  return post(`/conversations/${conversationId}/read`);
};
