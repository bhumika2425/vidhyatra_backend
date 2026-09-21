// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const { getStudentCount, getEligibleStudents } = require('../controllers/studentController');
const { authenticateUser } = require('../middleware/auth');

// Get count of students based on filters (for exam planning)
router.post('/count', authenticateUser, getStudentCount);

// Get list of eligible students for seat allocation
router.post('/eligible', authenticateUser, getEligibleStudents);

module.exports = router;
