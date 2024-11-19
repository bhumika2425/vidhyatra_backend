// controllers/profileController.js
const profileService = require('../services/profileService');
const Profile = require('../models/profileModel'); // Assuming you have a Profile model


const createProfile = async (req, res) => {
  try {
    console.log("Incoming request body:", req.body); // Log incoming request body

    const user = req.user;

    console.log("User in request:", user); // Log the user object

    // Ensure user is authenticated
    if (!user || !user.user_id) {
      console.log(req.user)
      return res.status(401).json({ message: 'Unauthorized: No user logged in.' });
    }

    // Initialize profileData with the incoming request body
    const profileData = req.body;

    // Set user_id to the authenticated user's ID
    profileData.user_id = req.user.user_id;

    // Check if a file is uploaded
    if (req.file) {
      const serverUrl = 'http://10.0.2.2:3001'; // Replace with your server's base URL
      profileData.profileImageUrl = `${serverUrl}/uploads/profile-images/${req.file.filename}`; // Store the complete URL
    }

    const newProfile = await profileService.createProfile(profileData);
    res.status(201).json({
      message: 'Student profile created successfully',
      data: newProfile
    });
  } catch (error) {
    console.error("Error in profile creation:", error.message);
    res.status(500).json({
      message: error.message
    });
  }
};

// Check if profile exists for the authenticated user
const checkProfileExists = async (req, res) => {
    try {
        const userId = req.user.user_id; // Extract user ID from req.user set by authentication middleware
        const profile = await Profile.findOne({ where: { user_id: userId } });

        if (profile) {
            return res.status(200).json({ exists: true, profile });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch profile data for the authenticated user
const getProfileData = async (req, res) => {
    try {
        const userId = req.user.user_id; // Extract user ID from req.user set by authentication middleware
        const profile = await Profile.findOne({ where: { user_id: userId } });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.status(200).json({
            message: 'Profile fetched successfully',
            profile
        });
    } catch (error) {
        console.error("Error fetching profile data:", error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const updatedData = req.body;

    // Update profile image if a new file is uploaded
    if (req.file) {
      const serverUrl = 'http://10.0.2.2:3001';
      updatedData.profileImageUrl = `${serverUrl}/uploads/profile-images/${req.file.filename}`;
    }

    const updatedProfile = await profileService.updateProfile(userId, updatedData);
    if (updatedProfile) {
      res.status(200).json({
        message: 'Profile updated successfully',
        profile: updatedProfile,
      });
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (error) {
    console.error("Error updating profile:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    createProfile,
    checkProfileExists,
    getProfileData, // Add the new function here
    updateProfile,
  };