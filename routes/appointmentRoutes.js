// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controller/appointmentController');
const { authenticateUser, authenticateAdmin, authenticateUserOrAdmin } = require('../middleware/auth');

// Student routes
router.post('/book', authenticateUser, appointmentController.bookAppointment);
router.get('/student', authenticateUser, appointmentController.getStudentAppointments);

// Teacher routes
router.get('/teacher', authenticateUser, appointmentController.getTeacherAppointments);

// Shared routes
router.get('/appointmentDetails/:appointment_id', authenticateUserOrAdmin, appointmentController.getAppointmentDetail);
router.put('/appointmentDetails/:appointment_id/cancel', authenticateUser, appointmentController.cancelAppointment);

router.get('/teachers', authenticateUser, appointmentController.getTeachers);


module.exports = router;