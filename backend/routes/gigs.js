/**
 * Gig Routes
 * 
 * Handles gig listing, creation, and retrieval.
 * SECURITY: Rate limited and input validated.
 * 
 * @module routes/gigs
 */

const express = require('express');
const router = express.Router();
const { getGigs, createGig, getMyGigs } = require('../controllers/gig');
const { authenticate } = require('../middleware/auth');

// Security middleware
const { apiLimiter } = require('../middleware/rateLimiter');
const { validateGig } = require('../middleware/validation');

// @route   GET /api/gigs
// @desc    Get all gigs (excluding own)
// @access  Private
router.get('/', authenticate, apiLimiter, getGigs);

// @route   POST /api/gigs
// @desc    Create a new gig
// @access  Private
// SECURITY: Input validated before processing
router.post('/', authenticate, apiLimiter, validateGig, createGig);

// @route   GET /api/gigs/my-gigs
// @desc    Get current user's gigs
// @access  Private
router.get('/my-gigs', authenticate, apiLimiter, getMyGigs);

module.exports = router;
