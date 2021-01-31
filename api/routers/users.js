const express = require('express');

// Controller goes here
// require...

// Router for the blog API routes
const router = express.Router();

// Register a new user
router.post('/register', (req, res, next) => {
  res.end('Register');
});
// Authorize a user
router.post('/login', (req, res, next) => {
  res.end('Login');
});
// Get current user details
router.get('/user', (req, res, next) => {
  res.end('Details');
});

module.exports = router;