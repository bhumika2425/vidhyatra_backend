
// routes/timeSlotRoutes.js
const express = require('express');
const router = express.Router();
const timeSlotController = require('../controller/timeSlotController');
const { authenticateUser } = require('../middleware/auth');

// Teacher routes
router.post('/create', authenticateUser, timeSlotController.createTimeSlot);
router.get('/teacher', authenticateUser, timeSlotController.getTeacherTimeSlots);
router.put('update/:slot_id', authenticateUser, timeSlotController.updateTimeSlot);
router.delete('delete/:slot_id', authenticateUser, timeSlotController.deleteTimeSlot);

// Student routes
router.get('/available', authenticateUser, timeSlotController.getAvailableTimeSlots);

module.exports = router;