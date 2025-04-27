// services/userService.js
const jwt = require('jsonwebtoken'); 
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { sequelizeIcpStudents } = require('../config/db');

const registerUser = async (collegeId, name, email, password, role) => {
    // Validate role
    if (!['Student', 'Teacher'].includes(role)) {
        throw new Error('Invalid role. Must be Student or Teacher.');
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        const error = new Error('Email already registered. Please use a different email.');
        error.statusCode = 409;
        throw error;
    }

    // Check if college ID is already registered
    const existingCollegeId = await User.findOne({ where: { college_id: collegeId } });
    if (existingCollegeId) {
        const error = new Error('College ID already registered. Please contact support if this is an error.');
        error.statusCode = 409;
        throw error;
    }

    try {
        // First check if the ID exists in students table
        const studentResults = await sequelizeIcpStudents.query(
            'SELECT * FROM students WHERE college_id = :collegeId AND email = :email',
            {
                replacements: { collegeId, email },
                type: sequelizeIcpStudents.QueryTypes.SELECT,
            }
        );

        // Then check if the ID exists in teachers table
        const teacherResults = await sequelizeIcpStudents.query(
            'SELECT * FROM teachers WHERE college_id = :collegeId AND email = :email',
            {
                replacements: { collegeId, email },
                type: sequelizeIcpStudents.QueryTypes.SELECT,
            }
        );

        // If ID exists in students table but trying to register as teacher
        if (studentResults.length > 0 && role === 'Teacher') {
            const error = new Error('This college ID belongs to a student. You cannot register as a teacher with a student ID.');
            error.statusCode = 400;
            throw error;
        }

        // If ID exists in teachers table but trying to register as student
        if (teacherResults.length > 0 && role === 'Student') {
            const error = new Error('This college ID belongs to a teacher. You cannot register as a student with a teacher ID.');
            error.statusCode = 400;
            throw error;
        }

        // If ID doesn't exist in the appropriate table
        if ((role === 'Student' && studentResults.length === 0) || 
            (role === 'Teacher' && teacherResults.length === 0)) {
            const error = new Error(`${role} ID or email not found in college database. Please verify your details.`);
            error.statusCode = 400;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ college_id: collegeId, name, email, password: hashedPassword, role });

        return { 
            name, 
            email, 
            message: `${role} registration successful!`,
            statusCode: 201
        };
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
            error.message = 'Server error during registration. Please try again.';
        }
        throw error;
    }
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