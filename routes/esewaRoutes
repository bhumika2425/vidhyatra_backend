const express = require("express");
const router = express.Router();
const esewaController = require("../controller/esewaController");
const authenticateUser = require("../middleware/auth");

router.post("/initialize-esewa",authenticateUser, esewaController.initializePayment);
router.get("/complete-payment", esewaController.completePayment);

module.exports = router;