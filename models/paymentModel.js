const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db'); // Importing the Sequelize instance
const PaidFees = require('../models/paidFeesModel'); // Importing the PurchasedItem model to reference it

const Payment = sequelizeVidhyatra.define('Payment', {
  paymentId: {
    type: DataTypes.INTEGER,
    primaryKey: true,  // Define paymentId as primary key
    autoIncrement: true, // Auto incrementing primary key
  },
  transactionId: {
    type: DataTypes.STRING,
    unique: true, // Transaction ID must be unique
    allowNull: true,
  },
  pidx: {
    type: DataTypes.STRING,
    unique: true, // Payment ID must be unique
    allowNull: true,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false, // Amount is required
  },
  dataFromVerificationReq: {
    type: DataTypes.JSONB, // Store as JSON
    allowNull: true, // Optional field
  },
  apiQueryFromUser: {
    type: DataTypes.JSONB, // Store as JSON
    allowNull: true, // Optional field
  },
  paymentGateway: {
    type: DataTypes.ENUM('khalti', 'esewa', 'connectIps'),
    allowNull: false, // Payment gateway is required
  },
  status: {
    type: DataTypes.ENUM('success', 'pending', 'failed'),
    defaultValue: 'pending', // Default status is "pending"
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Defaults to the current date
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
  tableName: 'payments'
});

// Define Associations with Explicit Foreign Key Naming
PaidFees.hasOne(Payment, { foreignKey: 'paidFeesId' });

Payment.belongsTo(PaidFees, {
  foreignKey: 'paidFeesId',
  onDelete: 'CASCADE',
});

module.exports = Payment;