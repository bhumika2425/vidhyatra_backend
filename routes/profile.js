// routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controller/profileController');
const { profileImageUpload } = require('../config/multerConfig');
const authenticate = require('../middleware/auth'); // Import the auth middleware
const Profile = require('../models/profileModel');

// POST request to create profile with image upload
router.post('/create', authenticate, profileImageUpload.single('profileImage'), profileController.createProfile);

router.get('/exists', authenticate, profileController.checkProfileExists);

// GET request to fetch profile data
router.get('/', authenticate, profileController.getProfileData); // New route for fetching profile data

// PUT request to update profile data
router.put('/update', authenticate, profileImageUpload.single('profileImage'), profileController.updateProfile);


module.exports = router;