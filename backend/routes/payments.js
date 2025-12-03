const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/payment');
const { authenticate } = require('../middleware/auth');

router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);

module.exports = router;
