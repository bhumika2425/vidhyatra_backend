// // controllers/profileController.js
// const profileService = require('../services/profileService');
// const Profile = require('../models/profileModel'); // Assuming you have a Profile model

// const createProfile = async (req, res) => {
//   try {
//     console.log("====== Incoming Create Profile Request ======");
//     console.log("Request body:", req.body);
//     console.log("Request file:", req.file);
//     console.log("Authenticated user:", req.user);

//     const user = req.user;

//     // Ensure user is authenticated
//     if (!user || !user.user_id) {
//       console.warn("⚠️ Unauthorized request: No user in request object");
//       return res.status(401).json({ message: 'Unauthorized: No user logged in.' });
//     }

//     // Prepare profile data
//     const profileData = req.body;
//     profileData.user_id = user.user_id;

//     console.log("📦 Initial profileData:", profileData);

//     // Attach Cloudinary URL if file exists
//     if (req.file) {
//       profileData.profileImageUrl = req.file.path;
//       console.log("🖼️ Cloudinary URL for profile image:", req.file.path);
//     }

//     // Final log before DB operation
//     console.log("🚀 Saving profile with data:", profileData);

//     const newProfile = await profileService.createProfile(profileData);

//     console.log("✅ Profile created successfully:", newProfile);

//     res.status(201).json({
//       message: 'Student profile created successfully',
//       data: newProfile,
//     });
//   } catch (error) {
//     console.error("❌ Error in profile creation:", error.message);
//     res.status(500).json({
//       message: 'Error creating profile',
//       error: error.message,
//     });
//   }
// };


// // Check if profile exists for the authenticated user
// const checkProfileExists = async (req, res) => {
//   try {
//     const userId = req.user.user_id; // Extract user ID from req.user set by authentication middleware
//     const profile = await Profile.findOne({ where: { user_id: userId } });

//     if (profile) {
//       return res.status(200).json({ exists: true, profile });
//     } else {
//       return res.status(200).json({ exists: false });
//     }
//   } catch (error) {
//     console.error("Error checking profile existence:", error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // Fetch profile data for the authenticated user
// const getProfileData = async (req, res) => {
//   try {
//     const userId = req.user.user_id; // Extract user ID from req.user set by authentication middleware
//     const profile = await Profile.findOne({ where: { user_id: userId } });

//     if (!profile) {
//       return res.status(404).json({ message: 'Profile not found' });
//     }

//     res.status(200).json({
//       message: 'Profile fetched successfully',
//       profile,
//     });
//   } catch (error) {
//     console.error("Error fetching profile data:", error.message);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.user_id;
//     const updatedData = req.body;

//     // Update profile image if a new file is uploaded
//     if (req.file) {
//       updatedData.profileImageUrl = req.file.path; // Use the Cloudinary URL from req.file.path
//       console.log("Updated Cloudinary URL for profile image:", updatedData.profileImageUrl);
//     }

//     const updatedProfile = await profileService.updateProfile(userId, updatedData);
//     if (updatedProfile) {
//       res.status(200).json({
//         message: 'Profile updated successfully',
//         profile: updatedProfile,
//       });
//     } else {
//       res.status(404).json({ message: 'Profile not found' });
//     }
//   } catch (error) {
//     console.error("Error updating profile:", error.message);
//     res.status(500).json({ message: 'Error updating profile', error: error.message });
//   }
// };

// module.exports = {
//   createProfile,
//   checkProfileExists,
//   getProfileData,
//   updateProfile,
// };
const profileService = require('../services/profileService');
const Profile = require('../models/profileModel'); // Assuming you have a Profile model

// Admin: Create a new profile
const createProfile = async (req, res) => {
  const { full_name, date_of_birth, location, department, year, semester, section, bio, interest } = req.body;

  try {
    console.log('Request Body:', req.body); // Debug log

    // Step 1: Verify if the user is authenticated
    const user = req.user;
    if (!user || !user.user_id) {
      return res.status(401).json({ message: 'Unauthorized: No user logged in.' });
    }

    // Validate full name
    if (!full_name) {
      return res.status(400).json({ message: 'Full name cannot be empty.' });
    }

    // Check if full name contains numbers
    if (/\d/.test(full_name)) {
      return res.status(400).json({ 
        message: 'Full name cannot contain numbers. Please enter alphabets only.' 
      });
    }
    // Step 2: Prepare profile data
    const profileData = {
      user_id: user.user_id,
      full_name,
      date_of_birth,
      location,
      department,
      year,
      semester,
      section,
      bio: bio || '', // Bio is optional
      interest: interest || '', // Interest is optional
    };

    // Attach profile image URL if file exists
    if (req.file) {
      profileData.profileImageUrl = req.file.path;
      console.log("🖼️ Cloudinary URL for profile image:", req.file.path);
    }

    // Step 3: Save profile data
    const newProfile = await profileService.createProfile(profileData);

    console.log('Profile created successfully:', newProfile);
    res.status(201).json({
      message: 'Student profile created successfully',
      data: newProfile,
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({
      message: 'Error creating profile',
      error: error.message,
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
    console.error('Error checking profile existence:', error.message);
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
      profile,
    });
  } catch (error) {
    console.error('Error fetching profile data:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update profile
// const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.user_id;
//     const updatedData = req.body;

//     // Update profile image if a new file is uploaded
//     if (req.file) {
//       updatedData.profileImageUrl = req.file.path; // Use the Cloudinary URL from req.file.path
//       console.log('Updated Cloudinary URL for profile image:', updatedData.profileImageUrl);
//     }

//     const updatedProfile = await profileService.updateProfile(userId, updatedData);
//     if (updatedProfile) {
//       res.status(200).json({
//         message: 'Profile updated successfully',
//         profile: updatedProfile,
//       });
//     } else {
//       res.status(404).json({ message: 'Profile not found' });
//     }
//   } catch (error) {
//     console.error('Error updating profile:', error.message);
//     res.status(500).json({ message: 'Error updating profile', error: error.message });
//   }
// };
// Update profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { full_name, date_of_birth, location, department, year, semester, section,  bio, interest } = req.body;

    const updatedData = {
      full_name,
      date_of_birth,
      location,
      department,
      year,
      semester,
      section,
      bio: bio || '',           // Ensure empty string if not provided
      interest: interest || '', // Ensure empty string if not provided
    };

    // Handle profile image update
    if (req.file) {
      updatedData.profileImageUrl = req.file.path;
      console.log('Updated Cloudinary URL for profile image:', updatedData.profileImageUrl);
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
    console.error('Error updating profile:', error.message);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

module.exports = {
  createProfile,
  checkProfileExists,
  getProfileData,
  updateProfile,
};
