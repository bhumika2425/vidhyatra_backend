const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');
const User = require('../models/user');

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
  full_name: {
    type: DataTypes.STRING(50),
  },
  date_of_birth: {
    type: DataTypes.DATE,
  },
  location: {
    type: DataTypes.STRING(100),
  },
  department: {
    type: DataTypes.STRING(100),
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
  bio: {
    type: DataTypes.TEXT,  // Ensure bio is in the model
  },
  interest: {
    type: DataTypes.TEXT,  // Ensure interest is in the model
  },

  profileImageUrl: {
    type: DataTypes.STRING(255),
  },
}, {
  timestamps: true,
  tableName: 'profiles',
});

Profile.belongsTo(User, { foreignKey: 'user_id', targetKey: 'user_id' });

module.exports = Profile;