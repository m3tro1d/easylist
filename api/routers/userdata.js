const express = require('express');

const ctrlUserdata = require('../controllers/userdata.js');
const auth = require('../../middleware/auth');
const getters = require('../../middleware/getters');

// Router for the blog API routes
const router = express.Router();

// Get user's virtues
router.get('/virtues', auth, getters.getUserById, ctrlUserdata.getVirtues);
// Get one virtue
router.get('/virtues/:virtueName', auth, getters.getUserById, getters.getVirtueByName, ctrlUserdata.getOneVirtue);
// Add user's virtue
router.post('/virtues', auth, getters.getUserById, ctrlUserdata.addVirtue);
// Update user's virtue
router.put('/virtues/:virtueName', auth, getters.getUserById, getters.getVirtueByName, ctrlUserdata.updateVirtue);
// Delete user's virtue
router.delete('/virtues/:virtueName', auth, getters.getUserById, getters.getVirtueByName, ctrlUserdata.deleteVirtue);

// Add a task in a virtue
router.post('/virtues/:virtueName/tasks/', auth, getters.getUserById, getters.getVirtueByName, ctrlUserdata.addTask);
// Delete a task
router.delete('/virtues/:virtueName/tasks/:taskId', auth, getters.getUserById, getters.getVirtueByName, ctrlUserdata.deleteTask);

module.exports = router;
