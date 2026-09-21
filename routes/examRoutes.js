// routes/examRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam,
    updateExamStatus
} = require('../controllers/examController');

// All routes require authentication
router.use(authenticateUser);

/**
 * @route   POST /api/exams
 * @desc    Create a new exam
 * @access  Private (Admin only)
 */
router.post('/', createExam);

/**
 * @route   GET /api/exams
 * @desc    Get all exams with optional filters
 * @access  Private (Admin only)
 * @query   status, faculty, year, semester, search, page, limit
 */
router.get('/', getAllExams);

/**
 * @route   GET /api/exams/:id
 * @desc    Get exam by ID with full details
 * @access  Private (Admin only)
 */
router.get('/:id', getExamById);

/**
 * @route   PUT /api/exams/:id
 * @desc    Update exam details
 * @access  Private (Admin only)
 */
router.put('/:id', updateExam);

/**
 * @route   DELETE /api/exams/:id
 * @desc    Delete exam
 * @access  Private (Admin only)
 */
router.delete('/:id', deleteExam);

/**
 * @route   PATCH /api/exams/:id/status
 * @desc    Update exam status (draft/allocated/published)
 * @access  Private (Admin only)
 */
router.patch('/:id/status', updateExamStatus);

module.exports = router;
