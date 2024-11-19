// controller/authcontroller.js
const { Op } = require('sequelize'); // Import Sequelize operators
const UserService = require('../services/userService');
const User = require('../models/user');
const jwt = require('jsonwebtoken'); // Import JWT for token generation
const bcrypt = require('bcrypt'); // Assuming you're using bcrypt for password hashing


const registerStudent = async (req, res) => {
    const { collegeId, name, email, password, role } = req.body;

    try {
        const result = await UserService.registerStudent(collegeId, name, email, password, role);
        res.status(201).json(result);
    } catch (error) {
        console.error(error); // Log the error to the console
        // Check for the specific error message
        if (error.message === 'Student ID or email not found in college database.') {
            return res.status(400).json({ message: error.message }); // Send specific error message
        }
        // Handle other server errors
        res.status(500).json({ message: 'Server error', error: error.message }); // Return the error message
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


module.exports = { registerStudent, loginUser };