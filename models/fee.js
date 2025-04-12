// const { DataTypes } = require("sequelize");
// const { sequelizeVidhyatra } = require("../config/db"); // Adjust the path if needed
// const User = require("./user"); // Import the User model
// const Admin = require("./adminModel");

// const Fee = sequelizeVidhyatra.define("Fee", {
//   feeID: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   feeType: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   feeDescription: {
//     type: DataTypes.TEXT,
//   },
//   feeAmount: {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//   },
//   dueDate: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
//   admin_id: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     references: {
//       model: Admin, // References the User model
//       key: "admin_id",
//     },
//     onDelete: "CASCADE", // If the user is deleted, their fees will be removed
//   },
// }, {
//   tableName: "fees",
//   timestamps: false,
// });

// // Define the relationship (A user can have multiple fees)
// User.hasMany(Fee, { foreignKey: "user_id" });
// Fee.belongsTo(User, { foreignKey: "user_id" });

// module.exports = Fee;

const { DataTypes } = require("sequelize");
const { sequelizeVidhyatra } = require("../config/db");
const Admin = require("./adminModel");

const Fee = sequelizeVidhyatra.define(
  "Fee",
  {
    feeID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    feeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    feeDescription: {
      type: DataTypes.TEXT,
    },
    feeAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Admin,
        key: "admin_id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "fees",
    timestamps: false,
  }
);

// Define the relationship (An admin can have multiple fees)
Admin.hasMany(Fee, { foreignKey: "admin_id" });
Fee.belongsTo(Admin, { foreignKey: "admin_id" });

module.exports = Fee;