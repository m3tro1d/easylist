const express = require('express');

// Controller goes here
const ctrlUserdata = require('../controllers/userdata.js');
const auth = require('../../middleware/auth');

// Router for the blog API routes
const router = express.Router();

// Get user's virtues
router.get('/virtues', auth, ctrlUserdata.getUserById, ctrlUserdata.getVirtues);
// Add user's virtue
router.post('/virtues', auth, ctrlUserdata.getUserById, ctrlUserdata.addVirtue);
// Update user's virtue
router.put('/virtues/:id', auth, ctrlUserdata.getUserById, ctrlUserdata.getVirtueById, ctrlUserdata.updateVirtue);
// Delete user's virtue
router.delete('/virtues/:id', auth, ctrlUserdata.getUserById, ctrlUserdata.getVirtueById, ctrlUserdata.deleteVirtue);

module.exports = router;
