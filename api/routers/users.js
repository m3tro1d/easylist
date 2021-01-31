const express = require('express');

// Controller goes here
const ctrlUsers = require('../controllers/users');

// Router for the blog API routes
const router = express.Router();

// Register a new user
router.post('/register', ctrlUsers.register);
// Authorize a user
router.post('/login', ctrlUsers.login);
// Get current user details
router.get('/user', ctrlUsers.getUser);

module.exports = router;
