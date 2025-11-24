const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, getQuickStats } = require('../controllers/user');
const { authenticate } = require('../middleware/auth');

const { uploadFields } = require('../middleware/upload');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', (req, res, next) => {
  uploadFields.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'resume', maxCount: 1 }])(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, message: 'Too many files uploaded for a field, or unexpected field.' });
      }
      if (req.fileValidationError) {
        return res.status(400).json({ success: false, message: req.fileValidationError });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticate, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, (req, res, next) => {
  uploadFields.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'resume', maxCount: 1 }])(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ success: false, message: 'Too many files uploaded for a field, or unexpected field.' });
      }
      if (req.fileValidationError) {
        return res.status(400).json({ success: false, message: req.fileValidationError });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, updateProfile);

// @route   GET /api/auth/quick-stats
// @desc    Get quick stats for the dashboard
// @access  Private
router.get('/quick-stats', authenticate, getQuickStats);

// @route   GET /api/auth/verify
// @desc    Verify token validity
// @access  Private
router.get('/verify', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

module.exports = router;