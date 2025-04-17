const express = require('express');
const router = express.Router();
const {
  getAllDeadlines,
  getDeadlineById,
  createDeadline,
  updateDeadline,
  markDeadlineCompleted,
  deleteDeadline,
} = require('../controller/deadlineController');
// const { authenticateUser } = require('../middleware/auth');
const { authenticateUser, authenticateUserOrAdmin } = require('../middleware/auth');
// router.get('/', getAllDeadlines);
router.get('/:id', getDeadlineById);
// router.post('/', authenticateUser, createDeadline);
router.post('/', authenticateUserOrAdmin, createDeadline);
router.put('/:id', updateDeadline);
router.patch('/:id/complete', markDeadlineCompleted);
router.delete('/:id', deleteDeadline);
router.get('/', authenticateUser, getAllDeadlines);

module.exports = router;