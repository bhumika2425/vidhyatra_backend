const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db'); // Adjust path as needed

const Friend = sequelizeVidhyatra.define('Friend', {
    friend_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user1_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Name of the referenced table
            key: 'user_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    user2_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'friends', // Explicitly define table name
    timestamps: false, // Disable automatic timestamps
});

module.exports = Friend;
