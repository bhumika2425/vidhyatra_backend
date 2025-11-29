// models/icpModels/Student.js
const { DataTypes } = require('sequelize');
const { sequelizeIcpStudents } = require('../../config/db');

const IcpStudent = sequelizeIcpStudents.define('Student', {
    student_id: {
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
    college_email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    department: {
        type: DataTypes.ENUM('BBA', 'BIT'),
        allowNull: false,
    },
    year: {
        type: DataTypes.ENUM('1st', '2nd', '3rd'),
        allowNull: false,
    },
    semester: {
        type: DataTypes.ENUM('1st', '2nd'),
        allowNull: false,
    },
    section: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    profile_image: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    phone_number: {
        type: DataTypes.STRING(15),
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
    }
}, {
    tableName: 'students',
    timestamps: false, // We're handling timestamps manually
});

module.exports = IcpStudent;
