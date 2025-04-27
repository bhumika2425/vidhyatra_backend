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
    const { collegeId, name, email, password, role } = req.body;

    try {
        // Validate role
        if (!['Student', 'Teacher'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be Student or Teacher.' });
        }

        const result = await UserService.registerUser(collegeId, name, email, password, role);

        res.status(201).json({
            message: `${role} registration successful!`,
            data: {
                name: result.name,
                email: result.email,
            },
        });
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
    const { identifier, password } = req.body;

    try {
        const result = await UserService.loginUser(identifier, password);
        res.status(200).json(result); // Send the token and user data in the response
    } catch (error) {
        console.error(error);
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
module.exports = { registerUser, loginUser, forgotPassword, verifyOtp, resetPassword , getAllUsers, getStudents, getTeachers, changePassword};