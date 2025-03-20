// services/userService.js
const jwt = require('jsonwebtoken'); // Import JWT
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { sequelizeIcpStudents } = require('../config/db');

const registerStudent = async (collegeId, name, email, password, role = 'Student') => {
    const results = await sequelizeIcpStudents.query(
        'SELECT * FROM students WHERE college_id = :collegeId AND email = :email',
        {
            replacements: { collegeId, email },
            type: sequelizeIcpStudents.QueryTypes.SELECT,
        }
    );

    if (results[0] === undefined) {
        throw new Error('Student ID or email not found in college database.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ college_id: collegeId, name, email, password: hashedPassword, role });

    return { name, email, message: 'Registration successful!' };
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
        { expiresIn: '1h' } // Set token expiration (optional)
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

// const getAllUsers = async (req, res) => {
//     const { page = 1, limit = 10 } = req.query; // Default to page 1, 10 users per page
//     const offset = (page - 1) * limit;

//     try {
//         const { rows: users, count } = await User.findAndCountAll({
//             offset,
//             limit: parseInt(limit, 10),
//             attributes: { exclude: ['password', 'otp', 'otpExpiry'] },
//         });
//         res.status(200).json({
//             message: 'Users retrieved successfully',
//             data: users,
//             total: count,
//             totalPages: Math.ceil(count / limit),
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };



module.exports = {
    registerStudent,
    loginUser,
    getAllUsers,
    getAllStudents,  // Add the function to exports
};