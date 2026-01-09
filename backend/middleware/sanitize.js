/**
 * Input Sanitization Middleware
 * 
 * Provides XSS protection and input sanitization following OWASP best practices.
 * Cleans user input to prevent injection attacks.
 * 
 * @module middleware/sanitize
 */

const validator = require('validator');

// ============================================================================
// Sanitization Functions
// ============================================================================

/**
 * Recursively sanitizes all string values in an object
 * Escapes HTML entities to prevent XSS attacks
 * 
 * @param {any} obj - Object to sanitize
 * @param {Object} options - Sanitization options
 * @returns {any} - Sanitized object
 */
const sanitizeObject = (obj, options = {}) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    let sanitized = validator.trim(obj);
    
    // Escape HTML entities to prevent XSS
    if (options.escapeHtml !== false) {
      sanitized = validator.escape(sanitized);
    }
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    // Normalize unicode (prevents homograph attacks)
    if (options.normalizeUnicode !== false) {
      sanitized = sanitized.normalize('NFC');
    }
    
    return sanitized;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
      // Sanitize keys as well (prevent prototype pollution)
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
      if (sanitizedKey && sanitizedKey !== '__proto__' && sanitizedKey !== 'constructor' && sanitizedKey !== 'prototype') {
        sanitized[sanitizedKey] = sanitizeObject(obj[key], options);
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Sanitizes email addresses
 * Normalizes and validates email format
 * 
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  return validator.normalizeEmail(validator.trim(email).toLowerCase()) || '';
};

/**
 * Sanitizes URL input
 * Validates and cleans URLs
 * 
 * @param {string} url - URL to sanitize
 * @returns {string} - Sanitized URL or empty string if invalid
 */
const sanitizeUrl = (url) => {
  if (typeof url !== 'string') return '';
  const trimmed = validator.trim(url);
  
  // Only allow http and https protocols
  if (!validator.isURL(trimmed, { protocols: ['http', 'https'], require_protocol: true })) {
    return '';
  }
  
  // Prevent javascript: and data: URLs
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '';
  }
  
  return trimmed;
};

/**
 * Sanitizes filenames to prevent path traversal
 * 
 * @param {string} filename - Filename to sanitize
 * @returns {string} - Sanitized filename
 */
const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') return '';
  
  // Remove path components
  let sanitized = filename.replace(/^.*[\\\/]/, '');
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"/\\|?*\x00-\x1f]/g, '');
  
  // Prevent hidden files
  if (sanitized.startsWith('.')) {
    sanitized = sanitized.substring(1);
  }
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.slice(sanitized.lastIndexOf('.'));
    sanitized = sanitized.slice(0, 255 - ext.length) + ext;
  }
  
  return sanitized || 'unnamed';
};

/**
 * Middleware to sanitize request body
 * Should be applied after body parsing but before route handlers
 */
const sanitizeBody = (options = {}) => {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      // Don't sanitize passwords - they should be hashed, not escaped
      const passwordFields = ['password', 'currentPassword', 'newPassword', 'confirmPassword'];
      const savedPasswords = {};
      
      for (const field of passwordFields) {
        if (req.body[field]) {
          savedPasswords[field] = req.body[field];
        }
      }
      
      // Sanitize the body
      req.body = sanitizeObject(req.body, options);
      
      // Restore password fields
      for (const [field, value] of Object.entries(savedPasswords)) {
        req.body[field] = value;
      }
      
      // Special handling for email - use normalizeEmail
      if (req.body.email) {
        req.body.email = sanitizeEmail(req.body.email);
      }
      
      // Special handling for URL fields
      const urlFields = ['imageUrl', 'projectUrl', 'website', 'linkedIn', 'github'];
      for (const field of urlFields) {
        if (req.body[field]) {
          req.body[field] = sanitizeUrl(req.body[field]);
        }
      }
    }
    
    next();
  };
};

/**
 * Middleware to sanitize query parameters
 */
const sanitizeQuery = (options = {}) => {
  return (req, res, next) => {
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query, options);
    }
    next();
  };
};

/**
 * Middleware to sanitize URL parameters
 */
const sanitizeParams = (options = {}) => {
  return (req, res, next) => {
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params, options);
    }
    next();
  };
};

/**
 * Combined sanitization middleware
 * Sanitizes body, query, and params
 */
const sanitizeAll = (options = {}) => {
  return (req, res, next) => {
    // Sanitize body (with password preservation)
    if (req.body && typeof req.body === 'object') {
      const passwordFields = ['password', 'currentPassword', 'newPassword', 'confirmPassword'];
      const savedPasswords = {};
      
      for (const field of passwordFields) {
        if (req.body[field]) {
          savedPasswords[field] = req.body[field];
        }
      }
      
      req.body = sanitizeObject(req.body, options);
      
      for (const [field, value] of Object.entries(savedPasswords)) {
        req.body[field] = value;
      }
      
      if (req.body.email) {
        req.body.email = sanitizeEmail(req.body.email);
      }
    }
    
    // Sanitize query
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query, options);
    }
    
    // Sanitize params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params, options);
    }
    
    next();
  };
};

/**
 * Prevents NoSQL injection by removing MongoDB operators from input
 * Should be used on endpoints that directly use user input in queries
 */
const preventNoSQLInjection = (req, res, next) => {
  const removeMongoOperators = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      // Remove $ prefix which could be used for MongoDB operators
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(removeMongoOperators);
    }
    
    if (typeof obj === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip keys that look like MongoDB operators
        if (!key.startsWith('$')) {
          cleaned[key] = removeMongoOperators(value);
        }
      }
      return cleaned;
    }
    
    return obj;
  };
  
  if (req.body) {
    req.body = removeMongoOperators(req.body);
  }
  if (req.query) {
    req.query = removeMongoOperators(req.query);
  }
  
  next();
};

module.exports = {
  sanitizeObject,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeFilename,
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams,
  sanitizeAll,
  preventNoSQLInjection,
};
