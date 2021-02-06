const express = require('express');

const ctrlUserdata = require('../controllers/userdata.js');
const auth = require('../../middleware/auth');
const getters = require('../../middleware/getters');

// Router for the blog API routes
const router = express.Router();

// Get user's virtues
router.get('/virtues', auth, getters.getUserById, ctrlUserdata.getVirtues);
// Get one virtue
router.get('/virtues/:id', auth, getters.getUserById, getters.getVirtueById, ctrlUserdata.getOneVirtue);
// Add user's virtue
router.post('/virtues', auth, getters.getUserById, ctrlUserdata.addVirtue);
// Update user's virtue
router.put('/virtues/:id', auth, getters.getUserById, getters.getVirtueById, ctrlUserdata.updateVirtue);
// Delete user's virtue
router.delete('/virtues/:id', auth, getters.getUserById, getters.getVirtueById, ctrlUserdata.deleteVirtue);

// Add a task in a virtue
router.post('/virtues/:id/task', auth, getters.getUserById, getters.getVirtueById, ctrlUserdata.addTask)

module.exports = router;
