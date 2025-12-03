const express = require('express');
const router = express.Router();
const { getOrders, createOrder, getSales, completeBySeller, clearPayment } = require('../controllers/order');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getOrders);
router.get('/sales', authenticate, getSales);
router.post('/', authenticate, createOrder);
router.put('/:id/complete-by-seller', authenticate, completeBySeller);
router.post('/:id/clear-payment', authenticate, clearPayment);

module.exports = router;
