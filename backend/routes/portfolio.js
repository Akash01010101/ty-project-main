const express = require('express');
const router = express.Router();
const { getPortfolio, addPortfolioItem } = require('../controllers/portfolio');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getPortfolio);
router.post('/', authenticate, addPortfolioItem);

module.exports = router;
