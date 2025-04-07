const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');

const Deadline = sequelizeVidhyatra.define('Deadline', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  course: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'createdAt',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updatedAt',
    onUpdate: DataTypes.NOW,
  },
  // 🎓 Updated to ENUM for Year
  year: {
    type: DataTypes.ENUM('1st Year', '2nd Year', '3rd Year'),
    allowNull: true,
  },

  // 🕒 Updated to ENUM for Semester
  semester: {
    type: DataTypes.ENUM('Semester 1', 'Semester 2'),
    allowNull: true,
  },
}, {
  tableName: 'deadlines',
  timestamps: true,
});

// Custom method to find by ID
Deadline.findById = async (id) => {
  return await Deadline.findOne({ where: { id } });
};

module.exports = Deadline;