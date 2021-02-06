const express = require('express');

const ctrlUserdata = require('../controllers/userdata.js');
const auth = require('../../middleware/auth');
const getters = require('../../middleware/getters');

// Router for the blog API routes
const router = express.Router();

// Get user's virtues
router.get('/virtues', auth, getters.getUserById, ctrlUserdata.getVirtues);
// Get one virtue
router.get('/virtues/:virtueId', auth, getters.getUserById, getters.getVirtueById, ctrlUserdata.getOneVirtue);
// Add user's virtue
router.post('/virtues', auth, getters.getUserById, ctrlUserdata.addVirtue);
// Update user's virtue
router.put('/virtues/:virtueId', auth, getters.getUserById, getters.getVirtueById, ctrlUserdata.updateVirtue);
// Delete user's virtue
router.delete('/virtues/:virtueId', auth, getters.getUserById, getters.getVirtueById, ctrlUserdata.deleteVirtue);

// Add a task in a virtue
router.post('/virtues/:virtueId/tasks/', auth, getters.getUserById, getters.getVirtueById, ctrlUserdata.addTask);
// Delete a task
router.delete('/virtues/:virtueId/tasks/:taskId', auth, getters.getUserById, getters.getVirtueById, ctrlUserdata.deleteTask);

module.exports = router;
