import { post } from '../utils';

export const createRazorpayOrder = (data) => {
  return post('/payments/create-order', data);
};

export const verifyPayment = (data) => {
  return post('/payments/verify', data);
};
