/**
 * Offer Routes
 * 
 * Handles offer creation and status updates.
 * SECURITY: Rate limited and input validated.
 * 
 * @module routes/offers
 */

const express = require('express');
const router = express.Router();
const {
  createOffer,
  updateOfferStatus,
  getOffers,
} = require('../controllers/offer');
const { authenticate } = require('../middleware/auth');

// Security middleware
const { apiLimiter, sensitiveLimiter } = require('../middleware/rateLimiter');
const { validateOffer, validateOfferStatus, validateObjectIdParam } = require('../middleware/validation');

// @route   POST /api/offers
// @desc    Create a new offer
// @access  Private
// SECURITY: Input validated, rate limited for sensitive operation
router.post('/', authenticate, sensitiveLimiter, validateOffer, createOffer);

// @route   PUT /api/offers/:id
// @desc    Update offer status (accept/decline/cancel)
// @access  Private
// SECURITY: ID and status validated, rate limited
router.put('/:id', authenticate, sensitiveLimiter, validateObjectIdParam('id'), validateOfferStatus, updateOfferStatus);

// @route   GET /api/offers
// @desc    Get all offers for current user
// @access  Private
router.get('/', authenticate, apiLimiter, getOffers);

module.exports = router;
