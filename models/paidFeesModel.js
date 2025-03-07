const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db'); // Importing the Sequelize instance
const Fee = require('./fee'); // Importing the Fee model to reference it

const PaidFees = sequelizeVidhyatra.define('PaidFees', {
  paidFeesId: {
    type: DataTypes.STRING,
    primaryKey: true, 
    autoIncrement: true, // Auto incrementing primary key
  },
  totalPrice: {
    type: DataTypes.FLOAT,
    allowNull: false, // Total price is required
  },
  paidDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Defaults to the current date
  },
  paymentMethod: {
    type: DataTypes.ENUM('esewa', 'khalti'),
    allowNull: false, // Payment method is required
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'refunded'),
    defaultValue: 'pending', // Default status is "pending"
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  tableName: 'paid_fees'
});


PaidFees.belongsTo(Fee, {
  foreignKey: 'feeID', // Correct foreign key field
  allowNull: false, // Foreign key cannot be null
  onDelete: 'CASCADE',
});

module.exports = PaidFees;