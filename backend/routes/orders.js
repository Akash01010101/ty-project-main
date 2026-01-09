/**
 * Order Routes
 * 
 * Handles order management for buyers and sellers.
 * SECURITY: Rate limited and input validated.
 * 
 * @module routes/orders
 */

const express = require('express');
const router = express.Router();
const { getOrders, createOrder, getSales, completeBySeller, clearPayment } = require('../controllers/order');
const { authenticate } = require('../middleware/auth');

// Security middleware
const { apiLimiter, sensitiveLimiter } = require('../middleware/rateLimiter');
const { validateOrder, validateClearPayment, validateObjectIdParam } = require('../middleware/validation');

// @route   GET /api/orders
// @desc    Get current user's orders (as buyer)
// @access  Private
router.get('/', authenticate, apiLimiter, getOrders);

// @route   GET /api/orders/sales
// @desc    Get current user's sales (as seller)
// @access  Private
router.get('/sales', authenticate, apiLimiter, getSales);

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
// SECURITY: Input validated, rate limited
router.post('/', authenticate, sensitiveLimiter, validateOrder, createOrder);

// @route   PUT /api/orders/:id/complete-by-seller
// @desc    Mark order as completed by seller
// @access  Private
// SECURITY: ID validated, rate limited for sensitive operation
router.put('/:id/complete-by-seller', authenticate, sensitiveLimiter, validateObjectIdParam('id'), completeBySeller);

// @route   POST /api/orders/:id/clear-payment
// @desc    Clear payment and submit review
// @access  Private
// SECURITY: ID and review data validated, rate limited
router.post('/:id/clear-payment', authenticate, sensitiveLimiter, validateObjectIdParam('id'), validateClearPayment, clearPayment);

module.exports = router;
