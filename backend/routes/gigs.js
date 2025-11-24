const express = require('express');
const router = express.Router();
const { getGigs, createGig, getMyGigs } = require('../controllers/gig');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getGigs);
router.post('/', authenticate, createGig);
router.get('/my-gigs', authenticate, getMyGigs);

module.exports = router;
