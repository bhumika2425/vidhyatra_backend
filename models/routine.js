const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');

const Routine = sequelizeVidhyatra.define('Routine', {
  day: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  semester: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  section: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  room: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  module_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('ongoing', 'upcoming'),
    defaultValue: 'upcoming',
  },
}, {
  timestamps: true,  // Enable timestamps (created_at, updated_at)
  createdAt: 'created_at',  // Specify custom column name for createdAt
  updatedAt: 'updated_at',  // Specify custom column name for updatedAt
});

module.exports = Routine;
