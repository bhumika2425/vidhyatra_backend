const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');  // Adjust the path accordingly

const Admin = sequelizeVidhyatra.define('Admin', {
    admin_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
        type: DataTypes.STRING(10),
        defaultValue: 'Admin',
        allowNull: false,
    },
    admin_profile_picture: {  // Added field
        type: DataTypes.STRING(255),
        allowNull: true,  // Optional, can be null if no image is uploaded
    },

}, {
    tableName: 'admins',
    timestamps: true,
});

// Add a method to find admin by email (no hashing logic needed yet)
Admin.findByEmail = async (email) => {
    return await Admin.findOne({ where: { email } });
  };

module.exports = Admin;


