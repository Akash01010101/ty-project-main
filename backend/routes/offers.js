const express = require('express');
const router = express.Router();
const {
  createOffer,
  updateOfferStatus,
  getOffers,
} = require('../controllers/offer');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createOffer);
router.put('/:id', authenticate, updateOfferStatus);
router.get('/', authenticate, getOffers);

module.exports = router;
