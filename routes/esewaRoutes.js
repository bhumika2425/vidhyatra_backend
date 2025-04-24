const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const { initializePayment, completePayment, getPaymentHistory } = require("../controller/paymentController");

// Payment routes
router.post("/initialize-payment", authenticateUser, initializePayment);
router.get("/complete-payment", completePayment);
router.get("/payment-history", authenticateUser, getPaymentHistory);

module.exports = router;