const express = require('express');

const ctrlUserdata = require('../controllers/userdata.js');
const auth = require('../../middleware/auth');
const getters = require('../../middleware/getters');

// Router for the blog API routes
const router = express.Router();

// Get user's virtues
router.get('/virtues', auth, getters.getUserById, ctrlUserdata.getVirtues);
// Add user's virtue
router.post('/virtues', auth, getters.getUserById, ctrlUserdata.addVirtue);
// Update user's virtue
router.put('/virtues/:id', auth, getters.getUserById, getters.getVirtueById, ctrlUserdata.updateVirtue);
// Delete user's virtue
router.delete('/virtues/:id', auth, getters.getUserById, getters.getVirtueById, ctrlUserdata.deleteVirtue);

module.exports = router;
