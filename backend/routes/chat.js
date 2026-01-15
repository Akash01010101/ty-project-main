const express = require('express');
const router = express.Router();
const { chatWithBot } = require('../controllers/chat');
const { apiLimiter } = require('../middleware/rateLimiter');

// @route   POST /api/chat
// @desc    Chat with the bot
// @access  Public (or Private depending on needs, currently Public for Landing Page)
router.post('/', apiLimiter, chatWithBot);

module.exports = router;
