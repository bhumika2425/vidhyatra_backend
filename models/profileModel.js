const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');

const Profile = sequelizeVidhyatra.define('Profile', {
    profile_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id',
        },
    },
    nickname: {
        type: DataTypes.STRING(50),
    },
    date_of_birth: {
        type: DataTypes.DATE,
    },
    location: {
        type: DataTypes.STRING(100),
    },
    year: {
        type: DataTypes.STRING(10),
    },
    semester: {
        type: DataTypes.STRING(10),
    },
    profileImageUrl: {
        type: DataTypes.STRING(255),
    },
}, {
    timestamps: true,
    tableName: 'profiles',
});

module.exports = Profile;