import { post, put } from '../utils';

export const createOffer = (data) => {
  return post('/offers', data);
};

export const updateOfferStatus = (offerId, status) => {
  return put(`/offers/${offerId}`, { status });
};
