// models/icpModels/Teacher.js
const { DataTypes } = require('sequelize');
const { sequelizeIcpStudents } = require('../../config/db');

const IcpTeacher = sequelizeIcpStudents.define('Teacher', {
    teacher_id: {
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
    tableName: 'teachers',
    timestamps: false, // We're handling timestamps manually
});

module.exports = IcpTeacher;
