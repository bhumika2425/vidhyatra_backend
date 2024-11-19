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

    return { message: 'Registration successful!' };
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

module.exports = {
    registerStudent,
    loginUser
};