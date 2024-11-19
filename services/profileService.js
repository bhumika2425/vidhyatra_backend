// services/profileService.js
const Profile = require('../models/profileModel');

const createProfile = async (profileData) => {
  try {
    const newProfile = await Profile.create(profileData);
    return newProfile;
  } catch (error) {
    throw new Error('Error creating profile: ' + error.message);
  }
};

const updateProfile = async (userId, updatedData) => {
  try {
    const profile = await Profile.findOne({ where: { user_id: userId } });
    if (!profile) {
      return null; // Profile not found
    }
    // Update profile with new data
    await profile.update(updatedData);
    return profile; // Return the updated profile
  } catch (error) {
    throw new Error('Error updating profile: ' + error.message);
  }
};

// 
module.exports = {
    createProfile,
    updateProfile,
};