const express = require('express');

const ctrlUsers = require('../controllers/users');
const auth = require('../../middleware/auth');
const getters = require('../../middleware/getters');


const router = express.Router();

// Request registration
router.post('/register', ctrlUsers.register);
// Verify registration
router.get('/register/confirm', ctrlUsers.registerConfirm);
// Authorize a user
router.post('/login', ctrlUsers.login);
// Authorize a user via google oauth
router.post('/googlelogin', ctrlUsers.googleLogin);
// Get current user details
router.get('/user', auth, getters.getUserById, ctrlUsers.getUser);

// Get user amount
router.get('/amount', ctrlUsers.getUsersAmount);

module.exports = router;
