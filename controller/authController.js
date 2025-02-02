// controller/authcontroller.js
const { Op } = require('sequelize'); // Import Sequelize operators
const UserService = require('../services/userService');
const User = require('../models/user');
const jwt = require('jsonwebtoken'); // Import JWT for token generation
const bcrypt = require('bcrypt'); // Assuming you're using bcrypt for password hashing
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // To generate a secure OTP


// const registerStudent = async (req, res) => {
//     const { collegeId, name, email, password, role } = req.body;

//     try {
//         const result = await UserService.registerStudent(collegeId, name, email, password, role);
//         res.status(201).json(result);
//     } catch (error) {
//         console.error(error); // Log the error to the console
//         // Check for the specific error message
//         if (error.message === 'Student ID or email not found in college database.') {
//             return res.status(400).json({ message: error.message }); // Send specific error message
//         }
//         // Handle other server errors
//         res.status(500).json({ message: 'Server error', error: error.message }); // Return the error message
//     }
// };
const registerStudent = async (req, res) => {
    const { collegeId, name, email, password, role } = req.body;

    try {
        const result = await UserService.registerStudent(collegeId, name, email, password, role);

        // Include a clear success message
        res.status(201).json({
            message: 'Registration successful!',
            data: {
                name: result.name,
                email: result.email,
            },
        });
    } catch (error) {
        console.error(error); // Log the error to the console
        if (error.message === 'Student ID or email not found in college database.') {
            return res.status(400).json({ message: error.message }); // Send specific error message
        }
        res.status(500).json({ message: 'Server error', error: error.message }); // Return generic error
        // TODO: already registered wala mesaage baki
        // TODO: validation garna baki cha register ma
        //TODO: frontened ma icon haru ko color fherna cha ani euta lai feresi sabai huni wala lekhni 
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

module.exports = { registerStudent, loginUser, forgotPassword, verifyOtp, resetPassword , getAllUsers, };