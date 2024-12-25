const express = require('express');
const FeedbackController = require('../controller/FeedbackController');
const authenticateUser = require("../middleware/auth");

const router = express.Router();

// POST route for submitting feedback
router.post('/create',authenticateUser, FeedbackController.submitFeedback);

// GET route for retrieving all feedback (admin use)
router.get('/', FeedbackController.getAllFeedback);

// GET route for retrieving feedback by user ID
router.get('/:user_id', FeedbackController.getFeedbackByUser);

module.exports = router;
