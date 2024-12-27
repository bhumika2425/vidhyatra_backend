const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');

// Define Feedback Model
const Feedback = sequelizeVidhyatra.define('Feedback', {
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  feedback_type: {
    type: DataTypes.ENUM('courses', 'app_features', 'facilities'),
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

module.exports = Feedback;
