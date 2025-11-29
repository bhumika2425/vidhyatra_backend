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
    type: DataTypes.ENUM('BBA', 'BIT'),
    allowNull: true,
  },

  // 🎓 Year with standardized format
  year: {
    type: DataTypes.ENUM('1st Year', '2nd Year', '3rd Year'),
    allowNull: true,
  },

  // 🕒 Semester with standardized format  
  semester: {
    type: DataTypes.ENUM('Semester 1', 'Semester 2'),
    allowNull: true,
  },
  section: {
    type: DataTypes.ENUM('C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'),
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
  phone_number: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  college_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  subject: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  qualification: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'profiles',
});

Profile.belongsTo(User, { foreignKey: 'user_id', targetKey: 'user_id' });
User.hasOne(Profile, { foreignKey: 'user_id', sourceKey: 'user_id' });

module.exports = Profile;