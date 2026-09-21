// models/Classroom.js
const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');

const Classroom = sequelizeVidhyatra.define('Classroom', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    classroom_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Descriptive name like Fewa, Tilicho, Rara, Annapurna, etc.'
    },
    room_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    building: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    floor: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    rows: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        },
        comment: 'Number of rows in the classroom for seating layout'
    },
    columns: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        },
        comment: 'Number of columns per row in the classroom for seating layout'
    },
    type: {
        type: DataTypes.ENUM('Lecture Hall', 'Lab', 'Exam Hall', 'Auditorium', 'Classroom'),
        allowNull: false,
        defaultValue: 'Classroom'
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'classrooms',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['room_number', 'building']
        }
    ]
});

module.exports = Classroom;
