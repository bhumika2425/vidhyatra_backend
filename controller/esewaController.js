const { getEsewaPaymentHash, verifyEsewaPayment } = require("../esewa/esewa");
const { v4: uuidv4 } = require("uuid");
const Item = require("../models/itemModel");
const PurchasedItem = require("../models/purchasedItemModel");
const Payment = require("../models/paymentModel");

const initializePayment = async (req, res) => {
  try {
    const { itemId, totalPrice } = req.body;

    // Validate item exists and price matches
    const itemData = await Item.findOne({
      where: { itemId, price: Number(totalPrice) },
      attributes: ['price'],
    });

    if (!itemData) {
      return res.status(400).send({
        success: false,
        message: "Item not found or price mismatch.",
      });
    }

    // Calculate 5% commission
    // const commissionAmount = (totalPrice * 0.05).toFixed(2);
    // const totalPriceWithCommission = (parseFloat(totalPrice) + parseFloat(commissionAmount)).toFixed(2);


    // Create purchase record with UUID
    const purchasedItemId = uuidv4();
    const purchasedItemData = await PurchasedItem.create({
      purchasedItemId,
      itemId,
      paymentMethod: "esewa",
      totalPrice,
    });

    // Initiate payment with eSewa
    const paymentInitiate = await getEsewaPaymentHash({
      amount: totalPrice,
      transaction_uuid: purchasedItemData.purchasedItemId,
    });

    res.json({
      success: true,
      payment: paymentInitiate,
      purchasedItemData,
      // commission_amount: commissionAmount,
      // amount_with_commission: totalPriceWithCommission
    });
  } catch (error) {
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
    const purchasedItemData = await PurchasedItem.findByPk(transactionUuid);
    if (!purchasedItemData) {
      return res.status(500).json({ success: false, message: "Purchase not found" });
    }

    // Prepare payment data
    const paymentData = {
      pidx: paymentInfo.decodedData.transaction_code,
      transactionId: paymentInfo.decodedData.transaction_code,
      amount: purchasedItemData.totalPrice,
      dataFromVerificationReq: paymentInfo,
      apiQueryFromUser: req.query,
      paymentGateway: "esewa",
      status: "success",
      purchasedItemId: purchasedItemData.purchasedItemId,
    };

    // Save payment record
    const paymentRecord = await Payment.create(paymentData);

    // Update purchase status to completed
    await PurchasedItem.update({ status: "completed" }, { where: { purchasedItemId: transactionUuid } });

    res.json({ success: true, message: "Payment successful", paymentRecord });
  } catch (error) {
    res.status(500).json({ success: false, message: "An error occurred during payment verification", error: error.message });
  }
};

module.exports = { initializePayment, completePayment };