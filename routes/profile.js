// routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controller/profileController');
const { profileImageUpload } = require('../config/multerConfig');
const authenticateUser = require('../middleware/auth'); // Import the auth middleware
const Profile = require('../models/profileModel');

// POST request to create profile with image upload
router.post('/create', authenticateUser, profileImageUpload.single('profileImage'), profileController.createProfile);

router.get('/exists', authenticateUser, profileController.checkProfileExists);

// GET request to fetch profile data
router.get('/', authenticateUser, profileController.getProfileData); // New route for fetching profile data

// PUT request to update profile data
router.put('/update', authenticateUser, profileImageUpload.single('profileImage'), profileController.updateProfile);


module.exports = router;