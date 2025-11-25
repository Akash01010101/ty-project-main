const express = require('express');
const router = express.Router();
const { getOrders, createOrder, rejectOrder, getSales, completeOrder, confirmCompletion, deleteOrder } = require('../controllers/order');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getOrders);
router.get('/sales', authenticate, getSales);
router.post('/', authenticate, createOrder);
router.put('/:orderId/complete', authenticate, completeOrder);
router.put('/:orderId/confirm-completion', authenticate, confirmCompletion);
router.put('/:orderId/reject', authenticate, rejectOrder);
router.delete('/:orderId', authenticate, deleteOrder);

module.exports = router;
