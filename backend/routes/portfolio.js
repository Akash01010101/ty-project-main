/**
 * Portfolio Routes
 * 
 * Handles portfolio item management.
 * SECURITY: Rate limited and input validated.
 * 
 * @module routes/portfolio
 */

const express = require('express');
const router = express.Router();
const { getPortfolio, addPortfolioItem } = require('../controllers/portfolio');
const { authenticate } = require('../middleware/auth');

// Security middleware
const { apiLimiter } = require('../middleware/rateLimiter');
const { validatePortfolio } = require('../middleware/validation');

// @route   GET /api/portfolio
// @desc    Get current user's portfolio
// @access  Private
router.get('/', authenticate, apiLimiter, getPortfolio);

// @route   POST /api/portfolio
// @desc    Add a portfolio item
// @access  Private
// SECURITY: Input validated
router.post('/', authenticate, apiLimiter, validatePortfolio, addPortfolioItem);

module.exports = router;
