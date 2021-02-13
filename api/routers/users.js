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
// Get current user details
router.get('/user', auth, getters.getUserById, ctrlUsers.getUser);

module.exports = router;
