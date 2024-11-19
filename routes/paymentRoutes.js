// routes/paymentRoutes.js
const express = require('express');
const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
} = require('../controller/paymentController');

const router = express.Router();

router.post('/payments', createPayment);
router.get('/payments', getPayments);
router.get('/payments/:payment_id', getPaymentById);
router.patch('/payments/:payment_id/status', updatePaymentStatus);

module.exports = router;
