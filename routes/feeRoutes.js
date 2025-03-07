const express = require('express');
const router = express.Router();
const authenticateUser = require("../middleware/auth");
const feeController = require("../controller/feeController");

// Protecting the fee routes with authentication middleware
router.post('/fees', authenticateUser, feeController.addFee);   // Admin only
router.get('/fees', authenticateUser, feeController.getFees);   // Anyone can access
router.get('/fees/:id', authenticateUser, feeController.getFeeById); // Anyone can access
router.put('/fees/:id', authenticateUser, feeController.updateFee);  // Admin only
router.delete('/fees/:id', authenticateUser, feeController.deleteFee);  // Admin only

module.exports = router;
