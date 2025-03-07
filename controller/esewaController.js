const { getEsewaPaymentHash, verifyEsewaPayment } = require("../esewa/esewa");
const { v4: uuidv4 } = require("uuid");
const Fee = require("../models/fee");
const PaidFees = require("../models/paidFeesModel");
const Payment = require("../models/paymentModel");

const initializePayment = async (req, res) => {
    try {
      const { feeID, feeAmount } = req.body;
  
      // Debugging: Log the received feeID and totalPrice from the request body
      console.log("Received feeID:", feeID);
      console.log("Received totalPrice:", feeAmount);
  
      // Validate item exists and feeAmount matches
      const feeData = await Fee.findOne({
        where: { feeID, feeAmount: Number(feeAmount) },
        attributes: ['feeAmount', 'feeID'],
      });
  
      // Debugging: Log the result of the feeData query
      console.log("Fee Data from DB:", feeData);
  
      if (!feeData) {
        return res.status(400).send({
          success: false,
          message: "Fee not found or feeAmount mismatch.",
        });
      }
  
      // Debugging: Log that the fee was successfully found
      console.log("Fee found, proceeding with payment initialization.");
  
      // Create purchase record with UUID
      const paidFeesId = uuidv4();
      const paidFeesData = await PaidFees.create({
        paidFeesId,
        feeID,
        paymentMethod: "esewa",
        totalPrice: feeAmount,
      });
  
      // Debugging: Log the created paidFees data
      console.log("Created Paid Fees Data:", paidFeesData);
  
      // Initiate payment with eSewa
      const paymentInitiate = await getEsewaPaymentHash({
        amount: feeAmount,
        transaction_uuid: paidFeesData.paidFeesId,
      });
  
      // Debugging: Log the payment initiation data
      console.log("Payment Initiated with eSewa:", paymentInitiate);
  
      res.json({
        success: true,
        payment: paymentInitiate,
        paidFeesData,
        // commission_amount: commissionAmount,
        // amount_with_commission: totalPriceWithCommission
      });
    } catch (error) {
      // Debugging: Log the error if something goes wrong
      console.error("Error during payment initialization:", error);
  
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };


const completePayment = async (req, res) => {
  const { data } = req.query;

  try {
    // Verify payment with eSewa
    const paymentInfo = await verifyEsewaPayment(data);

    const transactionUuid = paymentInfo.response.transaction_uuid;
    if (!transactionUuid) {
      return res.status(400).json({ success: false, message: "Invalid transaction UUID" });
    }

    // Fetch purchased item
    const paidFeesData = await PaidFees.findByPk(transactionUuid);
    if (!paidFeesData) {
      return res.status(500).json({ success: false, message: "Purchase not found" });
    }

    // Prepare payment data
    const paymentData = {
      pidx: paymentInfo.decodedData.transaction_code,
      transactionId: paymentInfo.decodedData.transaction_code,
      amount: paidFeesData.totalPrice,
      dataFromVerificationReq: paymentInfo,
      apiQueryFromUser: req.query,
      paymentGateway: "esewa",
      status: "success",
      paidFeesId: paidFeesData.paidFeesId,
    };

    // Save payment record
    const paymentRecord = await Payment.create(paymentData);

    // Update purchase status to completed
    await PaidFees.update({ status: "completed" }, { where: { paidFeesId: transactionUuid } });

    res.json({ success: true, message: "Payment successful", paymentRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: "An error occurred during payment verification", error: error.message });
  }
};

module.exports = { initializePayment, completePayment };