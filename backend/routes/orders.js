const express = require('express');
const router = express.Router();
const { getOrders, createOrder, approveOrder, rejectOrder } = require('../controllers/order');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getOrders);
router.post('/', authenticate, createOrder);
router.put('/:orderId/approve', authenticate, approveOrder);
router.put('/:orderId/reject', authenticate, rejectOrder);

module.exports = router;
