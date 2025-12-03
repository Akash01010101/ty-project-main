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

router.get('/', authenticate, getConversations);
router.post('/', authenticate, createConversation);
router.get('/unread-count', authenticate, getUnreadCount);
router.get('/:id', authenticate, getMessages);
router.post('/:id/messages', authenticate, sendMessage);
router.post('/:id/read', authenticate, markAsRead);

module.exports = router;