const express = require('express');
const router = express.Router();
const { authenticateUser , authenticateAdmin , authenticateUserOrAdmin} = require("../middleware/auth");
const feeController = require("../controller/feeController");

// Protecting the fee routes with authentication middleware
router.post('/fees', authenticateAdmin, feeController.addFee);   // Admin only
router.get('/fees', authenticateUserOrAdmin, feeController.getFees);   // Anyone can access
router.get('/fees/:id', authenticateUserOrAdmin, feeController.getFeeById); // Anyone can access
router.put('/fees/:id', authenticateAdmin, feeController.updateFee);  // Admin only
router.delete('/fees/:id', authenticateAdmin, feeController.deleteFee);  // Admin only

module.exports = router;
