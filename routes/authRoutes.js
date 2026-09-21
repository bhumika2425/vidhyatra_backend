// routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, forgotPassword, resetPassword, verifyOtp ,getAllUsers, getStudents, getTeachers, changePassword, updateFCMToken, removeFCMToken, checkFCMTokens, refreshAccessToken } = require('../controller/authController');
const { authenticateUser ,authenticateAdmin } = require('../middleware/auth');


const router = express.Router();
router.post('/register', registerUser);

router.post('/login', loginUser); // Add the login route

router.post('/forgot-password', forgotPassword); // Forgot password route

router.post('/verify-otp', verifyOtp);            // Step 2: Verify OTP
router.post('/reset-password', resetPassword);   // Reset password route

// Refresh token endpoint
router.post('/refresh-token', refreshAccessToken);

// Add a route to get all users
router.get('/users', authenticateUser, getAllUsers);
router.get('/students', authenticateAdmin, getStudents);
router.get('/teachers', authenticateAdmin, getTeachers);

router.post('/change-password', authenticateUser, changePassword);

// FCM Token management
router.post('/fcm-token', authenticateUser, updateFCMToken);
router.delete('/fcm-token', authenticateUser, removeFCMToken);
router.get('/check-fcm-tokens', checkFCMTokens); // For testing purposes

module.exports = router;