import { get } from '../utils';

export const getMyTransactions = () => {
  return get('/transactions/me');
};
