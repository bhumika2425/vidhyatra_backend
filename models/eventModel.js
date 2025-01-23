const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');
const User = require('./user'); // Assuming your User model is in the same directory

const Event = sequelizeVidhyatra.define('Event', {
    event_id: {
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
    event_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    created_by: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id',
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
    tableName: 'events',
    timestamps: false,
});

// Associations
User.hasMany(Event, { foreignKey: 'created_by', as: 'events' });
Event.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

module.exports = Event;
