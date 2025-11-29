// routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controller/profileController');
const { profileImageUpload } = require('../config/multerConfig');
const { authenticateUser } = require('../middleware/auth'); // Import the auth middleware

// GET request to check if profile exists (for backward compatibility)
router.get('/exists', authenticateUser, profileController.checkProfileExists);

// GET request to fetch profile data (read-only, from college database)
router.get('/', authenticateUser, profileController.getProfile);

// PUT request to update profile data (only editable fields: bio, interest, date_of_birth, location)
router.put('/update', authenticateUser, profileImageUpload.single('profileImage'), profileController.updateProfile);

// GET request to fetch all student profiles (admin/teacher only)
router.get('/students', authenticateUser, profileController.getAllStudentProfiles);

module.exports = router;