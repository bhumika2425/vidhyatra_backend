const express = require('express');
const router = express.Router();
const { createExam, getExams, getExamsByDate } = require('../controller/academicController');
const { authenticateUser, authenticateAdmin, authenticateUserOrAdmin } = require('../middleware/auth');

// Routes
router.post('/postExams', authenticateAdmin, createExam);          // Admin: Create an exam
router.get('/getExams', authenticateUserOrAdmin, getExams);       // User: Get all exams
router.get('/getExamsByDate/:date', authenticateUser, getExamsByDate); // User: Get exams for a specific date

module.exports = router;