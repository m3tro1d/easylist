const express = require('express');

// Controller goes here
// require...

// Router for the blog API routes
const router = express.Router();

// Get tasks
router.get('/tasks', (req, res, next) => {
  res.end('Tasks');
});
// Add a task
router.post('/tasks', (req, res, next) => {
  res.end('Create task.');
});
// Update a task
router.put('/tasks/:id', (req, res, next) => {
  res.end('Update task.');
});
// Delete a task
router.delete('/tasks/:id', (req, res, next) => {
  res.end('Delete task.');
});

// Get virtues
router.get('/virtues', (req, res, next) => {
  res.end('Virtues');
});
// Add a virtue
router.post('/virtues', (req, res, next) => {
  res.end('Create virtue.');
});
// Update a virtue
router.put('/virtues/:id', (req, res, next) => {
  res.end('Update virtue.');
});
// Delete a virtue
router.delete('/virtues/:id', (req, res, next) => {
  res.end('Delete virtue.');
});

module.exports = router;
