import { get, put } from '../utils';

export const followUser = (userId) => {
  return put(`/users/${userId}/follow`);
};

export const getUserProfile = (userId) => {
  return get(`/users/${userId}`);
};

export const getFollowing = () => {
  return get('/users/following');
};

export const getFollowers = () => {
  return get('/users/followers');
};
