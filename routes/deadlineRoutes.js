const express = require('express');
const router = express.Router();
const {
  getAllDeadlines,
  getAllDeadlinesAdmin,
  getDeadlineById,
  createDeadline,
  updateDeadline,
  markDeadlineCompleted,
  deleteDeadline,
} = require('../controller/deadlineController');
const { authenticateUser, authenticateUserOrAdmin } = require('../middleware/auth');

// Admin routes
router.get('/admin/all', authenticateUserOrAdmin, getAllDeadlinesAdmin);

// User routes
router.get('/', authenticateUser, getAllDeadlines);
router.get('/:id', getDeadlineById);
router.post('/', authenticateUserOrAdmin, createDeadline);
router.put('/:id', updateDeadline);
router.patch('/:id/complete', markDeadlineCompleted);
router.delete('/:id', deleteDeadline);

module.exports = router;