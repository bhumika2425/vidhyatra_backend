// controller/authcontroller.js
const { Op } = require('sequelize'); // Import Sequelize operators
const UserService = require('../services/userService');
const User = require('../models/user');
const jwt = require('jsonwebtoken'); // Import JWT for token generation
const bcrypt = require('bcrypt'); // Assuming you're using bcrypt for password hashing
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // To generate a secure OTP
const {getAllStudents} = require('../services/userService');
const {getAllTeachers} = require('../services/userService');

const registerUser = async (req, res) => {
    const { collegeId, email, password, confirm_password } = req.body;

    try {
        // Validate required fields (role is auto-determined)
        if (!collegeId || !email || !password || !confirm_password) {
            return res.status(400).json({ 
                message: 'All fields are required: collegeId, email, password, confirm_password' 
            });
        }

        // Auto-determine role based on college database lookup
        const result = await UserService.registerUser(collegeId, email, password, confirm_password);

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        if (error.message.includes('already registered')) {
            return res.status(409).json({ message: error.message });
        }
        if (error.message.includes('not found in college database')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Create a const function for user login logic
const loginUser = async (req, res) => {
    const { identifier, password, rememberMe } = req.body;

    console.log('🔐 Login attempt:');
    console.log('   Identifier:', identifier);
    console.log('   Password length:', password ? password.length : 0);
    console.log('   Remember Me:', rememberMe);
    console.log('   Request body:', JSON.stringify(req.body, null, 2));

    try {
        const result = await UserService.loginUser({ identifier, password, rememberMe });
        console.log('✅ Login successful for:', identifier);
        console.log('   User ID:', result.user?.user_id);
        console.log('   Is Admin:', result.user?.isAdmin);
        console.log('   Has Refresh Token:', !!result.refreshToken);
        res.status(200).json(result); // Send the token and user data in the response
    } catch (error) {
        console.error('❌ Login error:', error.message);
        console.error('   Full error:', error);
        if (error.message === 'Invalid credentials.') {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Step 1: Generate OTP and send to email
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    console.log('Email in forgotPassword:', email); 

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Email not registered' });
        }

        // Generate a random OTP (6 digits)
        const otp = crypto.randomInt(100000, 999999).toString();

        // Save OTP to the user model or cache for validation
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
        await user.save();

        // Send OTP via email using Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Step 2: Verify OTP (New route)
const verifyOtp = async (req, res) => {
    console.log('Request body in verifyOtp:', req.body); // Log request body
    const { email, otp } = req.body;
    console.log('Email in verifyOtp:', email, 'OTP:', otp); // Log email and otp

    try {
        const user = await User.findOne({ where: { email } });

        if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP is valid; Clear OTP fields but inform the client that verification was successful
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Step 3: Reset Password (Only after OTP verification)
const resetPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (newPassword !== confirmPassword) {
            console.log('Password mismatch error');
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// controller/authController.js
const changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const user_id = req.user.user_id; // From auth middleware
  
      // Validate input
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "Current password, new password, and confirmation are required" });
      }
  
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New password and confirmation do not match" });
      }
  
    //   // Optional: Add password strength validation
    //   if (newPassword.length < 8) {
    //     return res.status(400).json({ message: "New password must be at least 8 characters long" });
    //   }
  
      // Find the user
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10); // Simplified hashing
  
      // Update the password
      user.password = hashedPassword;
      await user.save();
  
      return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };

  
const getAllUsers = async (req, res) => {
    const userId = req.user.user_id;  // Extract the user ID from the JWT token

    try {
        const users = await UserService.getAllUsers(userId); // Pass userId to the service to exclude it
        const nonAdminUsers = users.filter(user => !user.isAdmin); // Exclude admins

        res.status(200).json({
            message: 'Users retrieved successfully',
            data: nonAdminUsers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getStudents = async (req, res) => {
    try {
        const students = await getAllStudents();
        res.status(200).json({ message: 'Students retrieved successfully', data: students });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
const getTeachers = async (req, res) => {
    try {
        const teachers = await getAllTeachers();
        res.status(200).json({
            message: 'Teachers retrieved successfully',
            data: teachers,
        });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update FCM Token
const updateFCMToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        const userId = req.user.user_id;

        console.log(`📱 Updating FCM token for user ${userId}`);

        if (!fcmToken || fcmToken.trim() === '') {
            return res.status(400).json({ 
                success: false,
                message: 'FCM token is required' 
            });
        }

        // Check if this token is already assigned to another user
        const existingUser = await User.findOne({
            where: { 
                fcmToken: fcmToken,
                user_id: { [Op.ne]: userId } // Not equal to current user
            }
        });

        if (existingUser) {
            console.log(`⚠️ FCM token already exists for user ${existingUser.user_id}, removing it`);
            // Clear the token from the other user
            await User.update(
                { fcmToken: null },
                { where: { user_id: existingUser.user_id } }
            );
            console.log(`✅ Removed duplicate FCM token from user ${existingUser.user_id}`);
        }

        // Update the current user's FCM token
        const [updated] = await User.update(
            { fcmToken: fcmToken },
            { where: { user_id: userId } }
        );

        if (updated) {
            console.log(`✅ FCM token updated for user ${userId}`);
            res.status(200).json({ 
                success: true,
                message: 'FCM token updated successfully' 
            });
        } else {
            console.log(`⚠️ User ${userId} not found`);
            res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
    } catch (error) {
        console.error('❌ Error updating FCM token:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating FCM token', 
            error: error.message 
        });
    }
};

// Remove FCM Token (called on logout)
const removeFCMToken = async (req, res) => {
    try {
        const userId = req.user.user_id;

        console.log(`🔴 Removing FCM token for user ${userId} (logout)`);

        // Clear the user's FCM token
        const [updated] = await User.update(
            { fcmToken: null },
            { where: { user_id: userId } }
        );

        if (updated) {
            console.log(`✅ FCM token removed for user ${userId}`);
            res.status(200).json({ 
                success: true,
                message: 'FCM token removed successfully' 
            });
        } else {
            console.log(`⚠️ User ${userId} not found`);
            res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }
    } catch (error) {
        console.error('❌ Error removing FCM token:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error removing FCM token', 
            error: error.message 
        });
    }
};

// Check FCM Tokens (for testing purposes)
const checkFCMTokens = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['user_id', 'name', 'email', 'college_id', 'fcmToken'],
            where: {
                fcmToken: { [Op.ne]: null } // Only return users with FCM tokens
            }
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('❌ Error fetching FCM tokens:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching FCM tokens', 
            error: error.message 
        });
    }
};

// Refresh access token using refresh token
const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    console.log('🔄 Refresh token request received');

    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        
        console.log('   Decoded refresh token:', decoded);

        // Check if it's a refresh token (not a regular access token)
        if (decoded.type !== 'refresh') {
            console.log('   ❌ Invalid token type');
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        // Find the user
        const user = await User.findOne({ where: { user_id: decoded.user_id } });

        if (!user) {
            console.log('   ❌ User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate new access token (30 days)
        const newAccessToken = jwt.sign(
            { 
                user_id: user.user_id, 
                role: user.role,
                isAdmin: user.isAdmin || false
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        console.log('   ✅ New access token generated for user:', user.user_id);

        res.status(200).json({ 
            accessToken: newAccessToken,
            message: 'Access token refreshed successfully'
        });
    } catch (error) {
        console.error('❌ Refresh token error:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Refresh token expired. Please login again.' });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { registerUser, loginUser, forgotPassword, verifyOtp, resetPassword , getAllUsers, getStudents, getTeachers, changePassword, updateFCMToken, removeFCMToken, checkFCMTokens, refreshAccessToken};
