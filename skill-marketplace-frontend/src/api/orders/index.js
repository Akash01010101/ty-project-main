import { get, post, put } from '../utils';

export const getMyPurchases = () => {
  return get('/orders');
};

export const getMySales = () => {
  return get('/orders/sales');
};

export const completeBySeller = (orderId) => {
  return put(`/orders/${orderId}/complete-by-seller`);
};

export const clearPayment = (orderId, reviewData) => {
  return post(`/orders/${orderId}/clear-payment`, reviewData);
};
