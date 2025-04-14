const Profile = require('../models/profileModel');

const createProfile = async (profileData) => {
  try {
    // Ensure bio and interest are included in the profileData
    const { bio, interest , section } = profileData;

    const newProfile = await Profile.create({
      ...profileData, // Spread the rest of the fields
      section: section || '',
      bio: bio || '',  // Default bio to an empty string if not provided
      interest: interest || '', // Default interest to an empty string if not provided
    });

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

    // Update profile with new data, including bio and interest
    const { bio, interest , section } = updatedData;

    await profile.update({
      ...updatedData,
      section: section || profile.section,
      bio: bio || profile.bio, // If bio is provided, update; otherwise, keep old bio
      interest: interest || profile.interest, // If interest is provided, update; otherwise, keep old interest
    });

    return profile; // Return the updated profile
  } catch (error) {
    throw new Error('Error updating profile: ' + error.message);
  }
};

module.exports = {
  createProfile,
  updateProfile,
};
