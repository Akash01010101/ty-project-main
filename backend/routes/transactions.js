/**
 * Transaction Routes
 * 
 * Handles financial transaction records.
 * SECURITY: Rate limited and input validated.
 * 
 * @module routes/transactions
 */

const express = require('express');
const router = express.Router();
const { getTransactions, addTransaction, getMyTransactions } = require('../controllers/transaction');
const { authenticate } = require('../middleware/auth');

// Security middleware
const { apiLimiter, sensitiveLimiter } = require('../middleware/rateLimiter');
const { validateTransaction } = require('../middleware/validation');

// @route   GET /api/transactions
// @desc    Get current user's transactions
// @access  Private
router.get('/', authenticate, apiLimiter, getTransactions);

// @route   GET /api/transactions/me
// @desc    Get current user's transactions (alternate endpoint)
// @access  Private
router.get('/me', authenticate, apiLimiter, getMyTransactions);

// @route   POST /api/transactions
// @desc    Add a transaction record
// @access  Private
// SECURITY: Input validated, rate limited for financial operations
router.post('/', authenticate, sensitiveLimiter, validateTransaction, addTransaction);

module.exports = router;
