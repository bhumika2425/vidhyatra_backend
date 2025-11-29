// services/profileService.js
const Profile = require('../models/profileModel');
const User = require('../models/user');

/**
 * Get user profile (all data now stored locally in vidhyatra database)
 * No need to fetch from ICP database as all college data is stored during registration
 */
const getUserProfile = async (userId) => {
    try {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new Error('User not found');
        }

        const profile = await Profile.findOne({
            where: { user_id: userId }
        });

        if (!profile) {
            throw new Error('Profile not found');
        }

        // Return comprehensive profile data (all stored locally)
        const profileData = {
            user_id: user.user_id,
            college_id: user.college_id,
            name: user.name,
            email: user.email,
            role: user.role,
            email_verified: user.email_verified,
            // All profile data (academic + personal)
            full_name: profile.full_name,
            department: profile.department,
            year: profile.year,
            semester: profile.semester,
            section: profile.section,
            phone_number: profile.phone_number,
            college_email: profile.college_email,
            profileImageUrl: profile.profileImageUrl,
            bio: profile.bio,
            interest: profile.interest,
            date_of_birth: profile.date_of_birth,
            location: profile.location,
            // Teacher-specific fields
            subject: profile.subject,
            qualification: profile.qualification,
            // Timestamps
            createdAt: user.created_at,
            updatedAt: profile.updatedAt
        };

        return profileData;
    } catch (error) {
        throw new Error(`Unable to fetch profile: ${error.message}`);
    }
};

/**
 * Update only editable fields for students (bio, interest, date_of_birth, location)
 * Academic information cannot be changed as it comes from college database
 */
const updateUserProfile = async (userId, updateData) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // For students, only allow updating non-academic fields
        const allowedFields = ['bio', 'interest', 'date_of_birth', 'location'];
        
        if (user.role === 'Student') {
            // Filter out any academic fields that students shouldn't modify
            const filteredData = {};
            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key)) {
                    filteredData[key] = updateData[key];
                }
            });
            updateData = filteredData;
        }

        const [updatedRowsCount] = await Profile.update(updateData, {
            where: { user_id: userId }
        });

        if (updatedRowsCount === 0) {
            throw new Error('Profile not found or no changes made');
        }

        // Return updated profile
        return await getUserProfile(userId);
    } catch (error) {
        throw new Error(`Unable to update profile: ${error.message}`);
    }
};

/**
 * Get all students profiles (for admin/teacher use)
 */
const getAllStudentProfiles = async () => {
    try {
        const students = await User.findAll({
            where: { role: 'Student' },
            include: [{
                model: Profile,
                required: true
            }],
            attributes: { exclude: ['password', 'otp', 'otpExpiry'] }
        });

        return students.map(student => ({
            user_id: student.user_id,
            college_id: student.college_id,
            name: student.name,
            email: student.email,
            department: student.Profile.department,
            year: student.Profile.year,
            semester: student.Profile.semester,
            section: student.Profile.section,
            phone_number: student.Profile.phone_number,
            profileImageUrl: student.Profile.profileImageUrl
        }));
    } catch (error) {
        throw new Error(`Unable to fetch student profiles: ${error.message}`);
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getAllStudentProfiles
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
  getUserProfile,
  updateUserProfile,
  getAllStudentProfiles,
  // Legacy functions for backward compatibility
  getProfileById: getUserProfile,
  updateProfile: updateUserProfile
};
