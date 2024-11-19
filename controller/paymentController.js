// controllers/paymentController.js
const PaymentModel = require('../models/payment');
const Payment = PaymentModel();

const createPayment = async (req, res) => {
  try {
    const { user_id, payment_type, amount, due_date, year, semester, payment_method } = req.body;
    const newPayment = await Payment.create({
      user_id,
      payment_type,
      amount,
      due_date,
      year,
      semester,
      payment_method,
    });
    res.status(201).json(newPayment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating payment', error });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching payments', error });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const payment = await Payment.findOne({ where: { payment_id } });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching payment', error });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const { status } = req.body;
    const payment = await Payment.findOne({ where: { payment_id } });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    payment.status = status;
    await payment.save();
    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating payment', error });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
};
