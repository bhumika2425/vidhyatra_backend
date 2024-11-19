// services/paymentService.js
const PaymentModel = require('../models/payment');
const Payment = PaymentModel();

const addPayment = async (paymentData) => {
  return await Payment.create(paymentData);
};

const fetchAllPayments = async () => {
  return await Payment.findAll();
};

const fetchPaymentById = async (payment_id) => {
  return await Payment.findOne({ where: { payment_id } });
};

const changePaymentStatus = async (payment_id, status) => {
  const payment = await Payment.findOne({ where: { payment_id } });
  if (payment) {
    payment.status = status;
    await payment.save();
    return payment;
  }
  throw new Error('Payment not found');
};

module.exports = {
  addPayment,
  fetchAllPayments,
  fetchPaymentById,
  changePaymentStatus,
};
