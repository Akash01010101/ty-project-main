/**
 * Rate Limiting Middleware
 * 
 * Implements IP-based and user-based rate limiting following OWASP best practices.
 * Provides protection against brute-force attacks, DDoS, and API abuse.
 * 
 * @module middleware/rateLimiter
 */

const rateLimit = require('express-rate-limit');

/**
 * Custom key generator that combines IP and user ID (if authenticated)
 * This prevents a single user from abusing the API from multiple IPs
 * and also prevents IP-based attacks on authenticated endpoints.
 */
const keyGenerator = (req) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userId = req.user?.userId || 'anonymous';
  return `${ip}-${userId}`;
};

/**
 * IP-only key generator for public endpoints
 */
const ipKeyGenerator = (req) => {
  return req.ip || req.connection.remoteAddress || 'unknown';
};

/**
 * Standard response for rate limit exceeded (HTTP 429)
 * Following OWASP guidelines: informative but not revealing internal details
 */
const standardLimitHandler = (req, res, next, options) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
    retryAfter: Math.ceil(options.windowMs / 1000), // Retry after in seconds
    error: 'RATE_LIMIT_EXCEEDED'
  });
};

/**
 * Auth-specific rate limit handler (for login/register endpoints)
 * Slightly more informative to help legitimate users
 */
const authLimitHandler = (req, res, next, options) => {
  res.status(429).json({
    success: false,
    message: 'Too many authentication attempts. Please wait before trying again.',
    retryAfter: Math.ceil(options.windowMs / 1000),
    error: 'AUTH_RATE_LIMIT_EXCEEDED'
  });
};

// ============================================================================
// Rate Limiter Configurations
// ============================================================================

/**
 * Global rate limiter - applies to all routes
 * Generous limits for normal usage, prevents large-scale abuse
 * 
 * Limits: 100 requests per minute per IP
 */
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: ipKeyGenerator,
  handler: standardLimitHandler,
  skip: (req) => {
    // Skip rate limiting for health check endpoints
    return req.path === '/' || req.path === '/health';
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute-force attacks on login/register
 * 
 * Limits: 5 attempts per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5,
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  handler: authLimitHandler,
  skipSuccessfulRequests: false, // Count all attempts, even successful ones
});

/**
 * Sensitive operations rate limiter
 * For password reset, profile updates, payment operations
 * 
 * Limits: 10 requests per 15 minutes per IP+User
 */
const sensitiveLimiter = rateLimit({
  windowMs: parseInt(process.env.SENSITIVE_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.SENSITIVE_RATE_LIMIT_MAX) || 10,
  message: 'Too many sensitive operations, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyGenerator, // Uses both IP and user ID
  handler: standardLimitHandler,
});

/**
 * API endpoint rate limiter
 * For general authenticated API endpoints
 * 
 * Limits: 60 requests per minute per IP+User
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
  max: parseInt(process.env.API_RATE_LIMIT_MAX) || 60,
  message: 'API rate limit exceeded, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyGenerator,
  handler: standardLimitHandler,
});

/**
 * File upload rate limiter
 * Prevents abuse of file upload endpoints
 * 
 * Limits: 10 uploads per 10 minutes per IP+User
 */
const uploadLimiter = rateLimit({
  windowMs: parseInt(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000, // 10 minutes
  max: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX) || 10,
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyGenerator,
  handler: standardLimitHandler,
});

/**
 * Search endpoint rate limiter
 * Prevents scraping via search functionality
 * 
 * Limits: 30 searches per minute per IP
 */
const searchLimiter = rateLimit({
  windowMs: parseInt(process.env.SEARCH_RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
  max: parseInt(process.env.SEARCH_RATE_LIMIT_MAX) || 30,
  message: 'Too many search requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  handler: standardLimitHandler,
});

/**
 * Payment operations rate limiter
 * Extra strict for financial operations
 * 
 * Limits: 5 payment operations per 5 minutes per IP+User
 */
const paymentLimiter = rateLimit({
  windowMs: parseInt(process.env.PAYMENT_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 minutes
  max: parseInt(process.env.PAYMENT_RATE_LIMIT_MAX) || 5,
  message: 'Too many payment operations, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyGenerator,
  handler: standardLimitHandler,
});

/**
 * Message sending rate limiter
 * Prevents spam in messaging system
 * 
 * Limits: 30 messages per minute per IP+User
 */
const messageLimiter = rateLimit({
  windowMs: parseInt(process.env.MESSAGE_RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 minute
  max: parseInt(process.env.MESSAGE_RATE_LIMIT_MAX) || 30,
  message: 'Too many messages, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyGenerator,
  handler: standardLimitHandler,
});

module.exports = {
  globalLimiter,
  authLimiter,
  sensitiveLimiter,
  apiLimiter,
  uploadLimiter,
  searchLimiter,
  paymentLimiter,
  messageLimiter,
};
