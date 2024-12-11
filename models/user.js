// // models/user.js
// const { DataTypes } = require('sequelize');
// const { sequelizeVidhyatra } = require('../config/db');  // Adjust the path according to your config file location

// const User = sequelizeVidhyatra.define('User', {
//     user_id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//     },
//     college_id: {
//         type: DataTypes.STRING(50),
//         allowNull: false,
//         unique: true,
//     },
//     name: {
//         type: DataTypes.STRING(100),
//         allowNull: false,
//     },
//     email: {
//         type: DataTypes.STRING(100),
//         allowNull: false,
//         unique: true,
//     },
//     password: {
//         type: DataTypes.STRING(255),
//         allowNull: false,
//     },
//     role: {
//         type: DataTypes.ENUM('Student', 'Teacher'),
//         defaultValue: 'Student',
//     },
//     otp: {
//         type: DataTypes.STRING, // Store the OTP
//         allowNull: true,
//     },
//     otpExpiry: {
//         type: DataTypes.DATE, // Store OTP expiry time
//         allowNull: true,
//     },
//     created_at: {
//         type: DataTypes.DATE, // Changed from TIMESTAMP to DATE
//         defaultValue: DataTypes.NOW,
//         field: 'created_at', // to match your SQL table's column name
//     },
//     updated_at: { // Add updated_at field to your model
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//         field: 'updated_at', // to match your SQL table's column name
//         onUpdate: DataTypes.NOW // Automatically update this field on record update
//     }
// }, {
//     tableName: 'users', // Specify the table name
//     timestamps: false,   // Set to true if you want Sequelize to manage `createdAt` and `updatedAt` automatically
// });

// // Optional: Create a method to find user by college ID
// User.findByCollegeId = async (collegeId) => {
//     return await User.findOne({ where: { college_id: collegeId } });
// };

// module.exports = User;


const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');  // Adjust the path according to your config file location

const User = sequelizeVidhyatra.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    college_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('Student', 'Teacher'),
        defaultValue: 'Student',
    },
    otp: {
        type: DataTypes.STRING, // Store the OTP
        allowNull: true,
    },
    otpExpiry: {
        type: DataTypes.DATE, // Store OTP expiry time
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE, // Changed from TIMESTAMP to DATE
        defaultValue: DataTypes.NOW,
        field: 'created_at', // to match your SQL table's column name
    },
    updated_at: { // Add updated_at field to your model
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at', // to match your SQL table's column name
        onUpdate: DataTypes.NOW // Automatically update this field on record update
    }
}, {
    tableName: 'users', // Specify the table name
    timestamps: false,   // Set to true if you want Sequelize to manage `createdAt` and `updatedAt` automatically
});

// Optional: Create a method to find user by college ID
User.findByCollegeId = async (collegeId) => {
    return await User.findOne({ where: { college_id: collegeId } });
};

module.exports = User;
