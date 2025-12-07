const express = require('express');
const router = express.Router();
const { searchUsers, followUser, getUserProfile, getFollowing, getFollowers } = require('../controllers/user');
const { authenticate } = require('../middleware/auth');

router.get('/search', searchUsers);
router.get('/following', authenticate, getFollowing);
router.get('/followers', authenticate, getFollowers);
router.get('/:id', getUserProfile);
router.put('/:id/follow', authenticate, followUser);

module.exports = router;
