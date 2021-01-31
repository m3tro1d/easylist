const express = require('express');

// Controller goes here
const ctrlUserdata = require('../controllers/userdata.js');

// Router for the blog API routes
const router = express.Router();

// Get tasks
router.get('/tasks', ctrlUserdata.getTasks);
// Get one task
router.get('/tasks/:id', ctrlUserdata.getOneTask);
// Add a task
router.post('/tasks', ctrlUserdata.addTask);
// Update a task
router.put('/tasks/:id', ctrlUserdata.updateTask);
// Delete a task
router.delete('/tasks/:id', ctrlUserdata.deleteTask);

// Get virtues
router.get('/virtues', ctrlUserdata.getVirtues);
// Get one virtue
router.get('/virtues/:id', ctrlUserdata.getOneVirtue);
// Add a virtue
router.post('/virtues', ctrlUserdata.addVirtue);
// Update a virtue
router.put('/virtues/:id', ctrlUserdata.updateVirtue);
// Delete a virtue
router.delete('/virtues/:id', ctrlUserdata.deleteVirtue);

module.exports = router;
