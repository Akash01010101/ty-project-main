const express = require('express');
const router = express.Router();
const { getTransactions, addTransaction } = require('../controllers/transaction');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getTransactions);
router.post('/', authenticate, addTransaction);

module.exports = router;
