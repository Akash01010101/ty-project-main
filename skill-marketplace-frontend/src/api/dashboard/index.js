import { get, post, put, del } from '../utils';

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

const completeOrder = (orderId) => {
  return put(`/orders/${orderId}/complete`);
};

const confirmCompletion = (orderId) => {
  return put(`/orders/${orderId}/confirm-completion`);
};

const rejectOrder = (orderId) => {
  return put(`/orders/${orderId}/reject`);
};

const deleteOrder = (orderId) => {
  return del(`/orders/${orderId}`);
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

const getSales = () => {
  return get('/orders/sales');
};

export {
  getGigs,
  createGig,
  getMyGigs,
  getOrders,
  createOrder,
  rejectOrder,
  getPortfolio,
  addPortfolioItem,
  getTransactions,
  addTransaction,
  searchUsers,
  getSales,
  completeOrder,
  confirmCompletion,
  deleteOrder,
};