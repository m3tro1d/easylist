const express = require('express');

const ctrlUsers = require('../controllers/users');
const auth = require('../../middleware/auth');

// Router for the blog API routes
const router = express.Router();

// Register a new user
router.post('/register', ctrlUsers.register);
// Authorize a user
router.post('/login', ctrlUsers.login);
// Get current user details
router.get('/user', auth, ctrlUsers.getUser);

module.exports = router;
