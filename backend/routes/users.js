/**
 * User Routes
 * 
 * Handles user search, profiles, and follow functionality.
 * SECURITY: Rate limited and input validated.
 * 
 * @module routes/users
 */

const express = require('express');
const router = express.Router();
const { searchUsers, followUser, getUserProfile, getFollowing, getFollowers } = require('../controllers/user');
const { authenticate } = require('../middleware/auth');

// Security middleware
const { searchLimiter, apiLimiter, sensitiveLimiter } = require('../middleware/rateLimiter');
const { validateSearch, validateObjectIdParam } = require('../middleware/validation');

// @route   GET /api/users/search
// @desc    Search for users
// @access  Public
// SECURITY: Rate limited to prevent scraping
router.get('/search', searchLimiter, validateSearch, searchUsers);

// @route   GET /api/users/following
// @desc    Get users the current user is following
// @access  Private
router.get('/following', authenticate, apiLimiter, getFollowing);

// @route   GET /api/users/followers
// @desc    Get current user's followers
// @access  Private
router.get('/followers', authenticate, apiLimiter, getFollowers);

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
// SECURITY: ID validated, rate limited
router.get('/:id', searchLimiter, validateObjectIdParam('id'), getUserProfile);

// @route   PUT /api/users/:id/follow
// @desc    Follow/unfollow a user
// @access  Private
// SECURITY: Rate limited for sensitive social actions
router.put('/:id/follow', authenticate, sensitiveLimiter, validateObjectIdParam('id'), followUser);

module.exports = router;
