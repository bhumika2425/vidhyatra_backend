// models/payment.js
const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db'); // Ensure this points to your Vidhyatra Sequelize instance

const PaymentModel = () => {
  return sequelizeVidhyatra.define('Payment', {
    payment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Assuming you have a users table in the Vidhyatra database
        key: 'user_id',
      },
    },
    payment_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    year: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    semester: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Completed', 'Failed'),
      defaultValue: 'Pending',
    },
  }, {
    tableName: 'payments',
    timestamps: true,
  });
};

module.exports = PaymentModel;
