const express = require('express');
const { submitFeedback, getAllFeedback, getFeedbackByUser } = require('../controller/feedbackController');
const authenticateUser = require("../middleware/auth");

const router = express.Router();

// POST route for submitting feedback
router.post('/create', authenticateUser, submitFeedback);

// GET route for retrieving all feedback (admin use)
router.get('/', getAllFeedback);

// GET route for retrieving feedback by user ID (uses authenticated user's ID)
router.get('/my-feedback', authenticateUser, getFeedbackByUser);

module.exports = router;