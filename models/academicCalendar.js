// const { DataTypes } = require("sequelize");
// const { sequelizeVidhyatra } = require('../config/db');  // Ensure correct path to db.js
// const User = require("./user"); // Import User model if required for association
// const Profile = require("./profileModel"); // Import Profile model if needed
// const Event = require("./eventModel"); // If you need to associate with events in the future

// const AcademicCalendar = sequelizeVidhyatra.define(
//   "AcademicCalendar",
//   {
//     calendar_id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     type: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       validate: {
//         isIn: [['exam', 'semester', 'holiday']], // Limits to valid types
//       },
//     },
//     title: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     start_date: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     end_date: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW,
//     },
//     updatedAt: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW,
//     },
//   },
//   {
//     timestamps: true,  // Automatically includes createdAt and updatedAt fields
//     tableName: "academic_calendar",
//   }
// );

// // Association: Blog belongs to User (if required for this model)
// AcademicCalendar.belongsTo(User, { foreignKey: "user_id" });

// // Association with Profile model (if required for this model)
// AcademicCalendar.belongsTo(Profile, { foreignKey: "user_id", targetKey: "user_id", as: "profile" }); 

// // Possible future association with Event model (if relevant to your app)
// AcademicCalendar.hasMany(Event, { foreignKey: "calendar_id" });

// module.exports = AcademicCalendar;
