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
        allowNull: false,
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    otpExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
        onUpdate: DataTypes.NOW,
    }
}, {
    tableName: 'users',
    timestamps: false,
    hooks: {
        beforeSave: (user, options) => {
            if (user.isAdmin) {
                user.role = 'Admin'; // Automatically set role to 'Admin' if isAdmin is true
            }
        }
    }
});

// Optional: Create a method to find user by college ID
User.findByCollegeId = async (collegeId) => {
    return await User.findOne({ where: { college_id: collegeId } });
};

module.exports = User;



