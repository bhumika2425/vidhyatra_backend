const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');
const User = require('./user');

// Define Feedback Model
const Feedback = sequelizeVidhyatra.define('Feedback', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  feedback_type: {
    type: DataTypes.ENUM('courses',
    'app_features',
    'facilities',
    'faculty_behavior',
    'technical_support',
    'bug_report',
    'suggestions',
    'others'),
    allowNull: false,
  },
  feedback_content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Define association with User model
Feedback.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

module.exports = Feedback;
