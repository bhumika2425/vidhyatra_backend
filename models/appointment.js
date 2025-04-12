const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');

const Appointment = sequelizeVidhyatra.define('Appointment', {
    appointment_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    slot_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'time_slots',
            key: 'slot_id'
        }
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        defaultValue: 'pending'
    },
    reason: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
        onUpdate: DataTypes.NOW
    }
}, {
    tableName: 'appointments',
    timestamps: false
});

module.exports = Appointment;