const express = require('express');

const ctrlUserdata = require('../controllers/userdata.js');
const auth = require('../../middleware/auth');
const getters = require('../../middleware/getters');


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
// Update a task
router.put('/virtues/:virtueName/tasks/:taskId', auth, getters.getUserById, getters.getVirtueByName, ctrlUserdata.updateTask);
// Delete a task
router.delete('/virtues/:virtueName/tasks/:taskId', auth, getters.getUserById, getters.getVirtueByName, ctrlUserdata.deleteTask);

// Get all tasks merged into one array
router.get('/tasks', auth, getters.getUserById, ctrlUserdata.getTasks);
// Send the email survey
router.get('/tasks/survey', auth, getters.getUserById, ctrlUserdata.sendSurvey);

module.exports = router;
