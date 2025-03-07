const { DataTypes } = require("sequelize");
const { sequelizeVidhyatra } = require("../config/db"); // Adjust the path if needed
const User = require("./user"); // Import the User model

const Fee = sequelizeVidhyatra.define("Fee", {
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
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User, // References the User model
      key: "user_id",
    },
    onDelete: "CASCADE", // If the user is deleted, their fees will be removed
  },
}, {
  tableName: "fees",
  timestamps: false,
});

// Define the relationship (A user can have multiple fees)
User.hasMany(Fee, { foreignKey: "user_id" });
Fee.belongsTo(User, { foreignKey: "user_id" });

module.exports = Fee;