// routes/authRoutes.js
const express = require('express');
const { registerStudent, loginUser, forgotPassword, resetPassword, verifyOtp ,getAllUsers, getStudents, getTeachers } = require('../controller/authController');
const authenticateUser = require('../middleware/auth');


const router = express.Router();
router.post('/register', registerStudent);

router.post('/login', loginUser); // Add the login route

router.post('/forgot-password', forgotPassword); // Forgot password route

router.post('/verify-otp', verifyOtp);            // Step 2: Verify OTP
router.post('/reset-password', resetPassword);   // Reset password route

// Add a route to get all users
router.get('/users', authenticateUser, getAllUsers);
router.get('/students', authenticateUser, getStudents);
router.get('/teachers', authenticateUser, getTeachers);

module.exports = router;