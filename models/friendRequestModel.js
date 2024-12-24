//models./friendRequestModel.js

const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');// Adjust the path to your Sequelize configuration file

const FriendRequest = sequelizeVidhyatra.define('FriendRequest', {
    friend_request_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Name of the referenced table
            key: 'user_id', // Key in the referenced table
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Name of the referenced table
            key: 'user_id', // Key in the referenced table
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'friend_requests', // Explicitly define the table name
    timestamps: false, // Disable Sequelize's automatic timestamp fields
});

module.exports = FriendRequest;
