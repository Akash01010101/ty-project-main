/**
 * Payment Routes
 * 
 * Handles Razorpay payment integration.
 * SECURITY: Strictly rate limited and input validated for financial operations.
 * 
 * @module routes/payments
 */

const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/payment');
const { authenticate } = require('../middleware/auth');

// Security middleware
const { paymentLimiter } = require('../middleware/rateLimiter');
const { validatePaymentOrder, validatePaymentVerify } = require('../middleware/validation');

// @route   POST /api/payments/create-order
// @desc    Create a Razorpay order for payment
// @access  Private
// SECURITY: Strict rate limiting for payment operations, input validated
router.post('/create-order', authenticate, paymentLimiter, validatePaymentOrder, createOrder);

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment signature
// @access  Private
// SECURITY: Strict rate limiting, signature validation
router.post('/verify', authenticate, paymentLimiter, validatePaymentVerify, verifyPayment);

module.exports = router;
