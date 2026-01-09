/**
 * Conversation Routes
 * 
 * Handles messaging and conversations between users.
 * SECURITY: Rate limited and input validated.
 * 
 * @module routes/conversations
 */

const express = require('express');
const router = express.Router();
const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
} = require('../controllers/conversation');
const { authenticate } = require('../middleware/auth');
const { uploadFields } = require('../middleware/upload');

// Security middleware
const { apiLimiter, messageLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const { validateConversation, validateMessage, validateObjectIdParam } = require('../middleware/validation');

// @route   GET /api/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get('/', authenticate, apiLimiter, getConversations);

// @route   POST /api/conversations
// @desc    Create or get existing conversation
// @access  Private
// SECURITY: Input validated
router.post('/', authenticate, apiLimiter, validateConversation, createConversation);

// @route   GET /api/conversations/unread-count
// @desc    Get count of unread messages
// @access  Private
router.get('/unread-count', authenticate, apiLimiter, getUnreadCount);

// @route   GET /api/conversations/:id
// @desc    Get messages in a conversation
// @access  Private
// SECURITY: Conversation ID validated
router.get('/:id', authenticate, apiLimiter, validateObjectIdParam('id'), getMessages);

// @route   POST /api/conversations/:id/messages
// @desc    Send a message in a conversation
// @access  Private
// SECURITY: Rate limited for spam prevention, file uploads limited
router.post('/:id/messages', authenticate, messageLimiter, uploadLimiter, validateObjectIdParam('id'), uploadFields.single('messageFile'), validateMessage, sendMessage);

// @route   POST /api/conversations/:id/read
// @desc    Mark messages as read
// @access  Private
router.post('/:id/read', authenticate, apiLimiter, validateObjectIdParam('id'), markAsRead);

module.exports = router;