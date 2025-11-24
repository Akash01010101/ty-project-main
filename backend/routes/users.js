const express = require('express');
const router = express.Router();
const { searchUsers } = require('../controllers/user');

router.get('/search', searchUsers);

module.exports = router;
