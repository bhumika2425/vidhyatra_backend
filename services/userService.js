// services/userService.js
const jwt = require('jsonwebtoken'); // Import JWT
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { sequelizeIcpStudents } = require('../config/db');

const registerUser = async (collegeId, name, email, password, role) => {
    // Validate role
    if (!['Student', 'Teacher'].includes(role)) {
        throw new Error('Invalid role. Must be Student or Teacher.');
    }

    // Determine which table to query based on role
    const tableName = role === 'Student' ? 'students' : 'teachers';
    const errorMessage = `${role} ID or email not found in college database.`;

    // Query the appropriate table
    const results = await sequelizeIcpStudents.query(
        `SELECT * FROM ${tableName} WHERE college_id = :collegeId AND email = :email`,
        {
            replacements: { collegeId, email },
            type: sequelizeIcpStudents.QueryTypes.SELECT,
        }
    );

    if (results.length === 0) {
        throw new Error(errorMessage);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ college_id: collegeId, name, email, password: hashedPassword, role });

    return { name, email, message: `${role} registration successful!` };
};

const loginUser = async (identifier, password) => {
    const user = await User.findOne({
        where: {
            [Op.or]: [
                { email: identifier },
                { college_id: identifier }
            ]
        }
    });

    if (!user) {
        throw new Error('Invalid credentials.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials.');
    }

    // Generate JWT token
    const token = jwt.sign(
        { user_id: user.user_id, role: user.role },
        process.env.JWT_SECRET, // Secret key from your .env file
        { expiresIn: '30d' } // Set token expiration (optional)
    );

    const { password: _, ...userData } = user.dataValues;
    return { message: 'Login successful!', user: userData, token }; // Return token along with user data
};

const getAllUsers = async (currentUserId) => {
    try {
        const users = await User.findAll({
            where: {
                user_id: { [Op.ne]: currentUserId },  // Exclude the current user's ID
                isAdmin: false // Exclude admin users
            },
            attributes: { exclude: ['password', 'otp', 'otpExpiry'] }, // Exclude sensitive fields
        });
        return users;
    } catch (error) {
        console.error(error);
        throw new Error('Unable to fetch users');
    }
};

const getAllStudents = async () => {
    try {
        const students = await User.findAll({
            where: { role: 'Student' },  // Only fetch users with role "Student"
            attributes: { exclude: ['password', 'otp', 'otpExpiry'] }, // Exclude sensitive fields
        });
        return students;
    } catch (error) {
        console.error(error);
        throw new Error('Unable to fetch students');
    }
};

const getAllTeachers = async () => {
    try {
        const students = await User.findAll({
            where: { role: 'Teacher' },  // Only fetch users with role "Student"
            attributes: { exclude: ['password', 'otp', 'otpExpiry'] }, // Exclude sensitive fields
        });
        return students;
    } catch (error) {
        console.error(error);
        throw new Error('Unable to fetch teachers');
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getAllStudents, 
    getAllTeachers // Add the function to exports
};