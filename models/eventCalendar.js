const { DataTypes } = require("sequelize");
const { sequelizeVidhyatra } = require('../config/db');  // Ensure correct path to db.js
const User = require("./user");  // Import User model if needed for association
const Profile = require("./profileModel");  // Import Profile model if needed
const AcademicCalendar = require("./academicCalendar");  // Import AcademicCalendar model if needed

const EventCalendar = sequelizeVidhyatra.define(
  "EventCalendar",
  {
    event_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    event_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['cultural', 'sports', 'seminar', 'workshop']], // Limits to valid event types
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    event_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    color_code: {
      type: DataTypes.STRING,
      validate: {
        isIn: [['red', 'green', 'blue', 'yellow']],  // Limits color codes to specific values
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,  // Automatically includes createdAt and updatedAt fields
    tableName: "event_calendar",
  }
);

// Association with User (if needed for event creators)
EventCalendar.belongsTo(User, { foreignKey: "user_id" });

// Association with Profile (if necessary for more details about the user)
EventCalendar.belongsTo(Profile, { foreignKey: "user_id", targetKey: "user_id", as: "profile" });

// // Association with Academic Calendar (optional if an event is part of an academic schedule)
// EventCalendar.belongsTo(AcademicCalendar, { foreignKey: "academic_calendar_id", targetKey: "calendar_id" });

module.exports = EventCalendar;
