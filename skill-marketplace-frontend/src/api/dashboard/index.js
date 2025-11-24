import { get, post, put } from '../utils';

const getGigs = () => {
  return get('/gigs');
};

const createGig = (data) => {
  return post('/gigs', data);
};

const getMyGigs = () => {
  return get('/gigs/my-gigs');
};

const getOrders = () => {
  return get('/orders');
};

const createOrder = (data) => {
  return post('/orders', data);
};

const approveOrder = (orderId) => {
  return put(`/orders/${orderId}/approve`);
};

const rejectOrder = (orderId) => {
  return put(`/orders/${orderId}/reject`);
};

const getPortfolio = () => {
  return get('/portfolio');
};

const addPortfolioItem = (data) => {
  return post('/portfolio', data);
};

const getTransactions = () => {
  return get('/transactions');
};

const addTransaction = (data) => {
  return post('/transactions', data);
};

const searchUsers = (query) => {
  return get(`/users/search?q=${query}`);
};

export {
  getGigs,
  createGig,
  getMyGigs,
  getOrders,
  createOrder,
  approveOrder,
  rejectOrder,
  getPortfolio,
  addPortfolioItem,
  getTransactions,
  addTransaction,
  searchUsers,
};
