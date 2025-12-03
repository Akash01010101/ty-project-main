const express = require('express');
const router = express.Router();
const { getTransactions, addTransaction, getMyTransactions } = require('../controllers/transaction');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getTransactions);
router.get('/me', authenticate, getMyTransactions);
router.post('/', authenticate, addTransaction);

module.exports = router;
