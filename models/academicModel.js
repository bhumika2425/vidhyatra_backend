const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');
const Admin = require('./adminModel');

// Academic Model
const Academic = sequelizeVidhyatra.define('Academic', {
    exam_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    venue: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    exam_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    exam_start_time: {
        type: DataTypes.STRING(40),
        allowNull: false,
    },
    exam_duration: {
        type: DataTypes.STRING(50), // e.g., "2 hours" or "90 minutes"
        allowNull: false,
    },
    year: {
        type: DataTypes.ENUM('1st year', '2nd Year', '3rd Year'),
        allowNull: false,
    },
    created_by: {
        type: DataTypes.INTEGER,
        references: {
            model: Admin,
            key: 'admin_id',
        },
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
    },
}, {
    tableName: 'academic',
    timestamps: false,
});

// Associations
Academic.belongsTo(Admin, { foreignKey: 'created_by', as: 'creator' });

module.exports = Academic;