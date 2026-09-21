// routes/allocationRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
    generateAllocation,
    getAllocations,
    swapSeats,
    updateAllocation,
    deleteAllocations
} = require('../controllers/allocationController');

// All routes require authentication
router.use(authenticateUser);

/**
 * @route   POST /api/exams/:id/allocate
 * @desc    Generate seat allocation for an exam
 * @access  Private (Admin only)
 */
router.post('/:id/allocate', generateAllocation);

/**
 * @route   GET /api/exams/:id/allocations
 * @desc    Get all allocations for an exam
 * @access  Private (Admin only)
 */
router.get('/:id/allocations', getAllocations);

/**
 * @route   DELETE /api/exams/:id/allocations
 * @desc    Delete all allocations for an exam (reset)
 * @access  Private (Admin only)
 */
router.delete('/:id/allocations', deleteAllocations);

/**
 * @route   POST /api/allocations/swap
 * @desc    Swap two seat allocations
 * @access  Private (Admin only)
 */
router.post('/swap', swapSeats);

/**
 * @route   PUT /api/allocations/:id
 * @desc    Update a single allocation manually
 * @access  Private (Admin only)
 */
router.put('/:id', updateAllocation);

module.exports = router;
