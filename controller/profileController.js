// controller/profileController.js
const ProfileService = require('../services/profileService');

/**
 * Get user profile (read-only for students - data comes from college database)
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.user_id; // From auth middleware
        
        const profile = await ProfileService.getUserProfile(userId);
        
        res.status(200).json({
            message: 'Profile retrieved successfully',
            profile
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(404).json({ error: error.message });
    }
};

/**
 * Update user profile (limited fields for students)
 * Students can only update: bio, interest, date_of_birth, location
 * Academic fields (department, year, semester, section) are read-only from college database
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.user_id; // From auth middleware
        const updateData = req.body;
        
        // Filter allowed fields for updates
        const allowedUpdates = ['bio', 'interest', 'date_of_birth', 'location'];
        const filteredUpdateData = {};
        
        allowedUpdates.forEach(field => {
            if (updateData[field] !== undefined) {
                filteredUpdateData[field] = updateData[field];
            }
        });
        
        // Handle profile image update
        if (req.file) {
            filteredUpdateData.profileImageUrl = req.file.path;
            console.log('Updated Cloudinary URL for profile image:', filteredUpdateData.profileImageUrl);
        }
        
        const updatedProfile = await ProfileService.updateUserProfile(userId, filteredUpdateData);
        
        res.status(200).json({
            message: 'Profile updated successfully',
            profile: updatedProfile
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Get all student profiles (admin/teacher only)
 */
const getAllStudentProfiles = async (req, res) => {
    try {
        console.log('📋 Get all student profiles request:');
        console.log('   User ID:', req.user?.user_id);
        console.log('   Is Admin:', req.user?.isAdmin);
        console.log('   Role:', req.user?.role);
        
        // Check if user is admin or teacher (using isAdmin flag or role)
        if (!req.user.isAdmin && req.user.role !== 'Teacher') {
            console.log('❌ Access denied - not admin or teacher');
            return res.status(403).json({ 
                error: 'Access denied. Only admins and teachers can view all student profiles.' 
            });
        }
        
        console.log('✅ Access granted - fetching student profiles');
        const profiles = await ProfileService.getAllStudentProfiles();
        
        res.status(200).json({
            message: 'Student profiles retrieved successfully',
            count: profiles.length,
            profiles
        });
    } catch (error) {
        console.error('Get all profiles error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Check if profile exists for the authenticated user
 * (For backward compatibility with existing frontend)
 */
const checkProfileExists = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const profile = await ProfileService.getUserProfile(userId);
        
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

module.exports = {
    getProfile,
    updateProfile,
    getAllStudentProfiles,
    checkProfileExists,
    // Backward compatibility aliases
    getProfileData: getProfile
};
