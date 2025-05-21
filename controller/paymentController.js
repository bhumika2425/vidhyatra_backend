const { getEsewaPaymentHash, verifyEsewaPayment } = require("../esewa/esewa");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize"); // Add Sequelize Op import
const Fee = require("../models/fee");
const PaidFees = require("../models/paidFeesModel");
const Payment = require("../models/paymentModel");

// ...existing code...

const initializePayment = async (req, res) => {
    try {
        const { feeID, feeAmount } = req.body;
        const userId = req.user.user_id;

        // First validate fee exists and amount matches
        const feeData = await Fee.findOne({
            where: { feeID, feeAmount: Number(feeAmount) },
            attributes: ['feeAmount', 'feeID', 'feeType'],
        });

        if (!feeData) {
            return res.status(400).json({
                success: false,
                message: "Fee not found or feeAmount mismatch."
            });
        }

        // Check if user has already paid this fee in the current year
        const currentYear = new Date().getFullYear();
        const lastPayment = await PaidFees.findOne({
            where: {
                feeID,
                user_id: userId,
                status: 'completed',
                createdAt: {
                    [Op.and]: [
                        { [Op.gte]: new Date(currentYear, 0, 1) }, // Start of current year
                        { [Op.lte]: new Date(currentYear, 11, 31) } // End of current year
                    ]
                }
            },
            include: [{
                model: Payment,
                where: { status: 'success' },
                required: true
            }]
        });

        if (lastPayment) {
            return res.status(400).json({
                success: false,
                message: `This fee has already been paid for the year ${currentYear}. Next payment will be available in ${currentYear + 1}.`
            });
        }

        // Check for pending payment attempts (rate limiting)
        const pendingPayments = await PaidFees.count({
            where: {
                feeID,
                user_id: userId,
                status: { [Op.ne]: 'completed' },
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            }
        });

        if (pendingPayments >= 3) {
            return res.status(429).json({
                success: false,
                message: "Too many payment attempts. Please try again after 24 hours."
            });
        }

        // Continue with payment initialization
        const paidFeesId = uuidv4();
        let paidFeesData = await PaidFees.create({
            paidFeesId,
            feeID,
            paymentMethod: "esewa",
            totalPrice: feeAmount,
            user_id: userId,
            paymentYear: currentYear // Add payment year to track yearly payments
        });

        const paymentInitiate = await getEsewaPaymentHash({
            amount: feeAmount,
            transaction_uuid: paidFeesData.paidFeesId,
        });

        res.json({
            success: true,
            payment: paymentInitiate,
            paidFeesData,
        });

    } catch (error) {
        console.error("Error during payment initialization:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ...existing code...

// const initializePayment = async (req, res) => {
//     try {
//       const { feeID, feeAmount } = req.body;
//       const userId = req.user.user_id; // Get authenticated user ID

//       console.log("Authenticated User ID:", userId);
//       console.log("Received feeID:", feeID);
//       console.log("Received totalPrice:", feeAmount);

//       // Validate fee exists and feeAmount matches
//       const feeData = await Fee.findOne({
//         where: { feeID, feeAmount: Number(feeAmount) },
//         attributes: ['feeAmount', 'feeID'],
//       });

//       console.log("Fee Data from DB:", feeData);

//       if (!feeData) {
//         return res.status(400).send({
//           success: false,
//           message: "Fee not found or feeAmount mismatch.",
//         });
//       }

//       console.log("Fee found, checking for existing payment.");

//       // Check for existing non-completed payment
//       let paidFeesData = await PaidFees.findOne({
//         where: {
//           feeID,
//           user_id: userId,
//           status: { [Op.ne]: 'completed' } // Not equal to 'completed'
//         }
//       });

//       const paidFeesId = uuidv4();

//       if (paidFeesData) {
//         // Update existing record with new paidFeesId
//         console.log("Existing non-completed payment found, updating record.");
//         await PaidFees.update(
//           {
//             paidFeesId,
//             totalPrice: feeAmount,
//             paymentMethod: "esewa",
//             updatedAt: new Date()
//           },
//           {
//             where: {
//               paidFeesId: paidFeesData.paidFeesId // Update based on the existing paidFeesId
//             }
//           }
//         );

//         // Refresh the paidFeesData to reflect the updated values
//         paidFeesData = await PaidFees.findByPk(paidFeesId);
//         console.log("Updated Paid Fees Data:", paidFeesData);
//       } else {
//         // Create new record
//         console.log("No existing payment, creating new record.");
//         paidFeesData = await PaidFees.create({
//           paidFeesId,
//           feeID,
//           paymentMethod: "esewa",
//           totalPrice: feeAmount,
//           user_id: userId,
//         });
//       }

//       console.log("Paid Fees Data:", paidFeesData);

//       // Initiate payment with eSewa
//       const paymentInitiate = await getEsewaPaymentHash({
//         amount: feeAmount,
//         transaction_uuid: paidFeesData.paidFeesId,
//       });

//       console.log("Payment Initiated with eSewa:", paymentInitiate);

//       res.json({
//         success: true,
//         payment: paymentInitiate,
//         paidFeesData,
//       });
//     } catch (error) {
//       console.error("Error during payment initialization:", error);
//       res.status(500).json({
//         success: false,
//         error: error.message,
//       });
//     }
// };

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

    // Send HTML response directly
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Successful</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
              body {
                  font-family: 'Poppins', sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #e0f7fa 0%, #f0f2f5 100%);
              }
              .container {
                  text-align: center;
                  background: linear-gradient(145deg, #ffffff, #f8f9fa);
                  padding: 60px 40px;
                  border-radius: 16px;
                  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                  max-width: 400px;
                  width: 90%;
                  animation: scaleIn 0.5s ease-out;
              }
              .checkmark-container {
                  width: 120px;
                  height: 120px;
                  background-color: #00A651;
                  border-radius: 50%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  margin: 0 auto 30px;
                  box-shadow: 0 4px 12px rgba(0, 166, 81, 0.3);
                  animation: pulse 1.5s ease-in-out infinite;
              }
              .checkmark {
                  font-size: 60px;
                  color: white;
              }
              h1 {
                  color: #1a202c;
                  font-size: 28px;
                  font-weight: 700;
                  margin-bottom: 16px;
              }
              p {
                  color: #4a5568;
                  font-size: 16px;
                  line-height: 1.5;
                  margin-bottom: 20px;
              }
              .transaction-details {
                  background: #f1f5f8;
                  padding: 12px 20px;
                  border-radius: 8px;
                  margin-bottom: 30px;
                  font-size: 14px;
                  color: #2d3748;
              }
              .transaction-details span {
                  font-weight: 600;
              }
              .btn {
                  display: inline-block;
                  padding: 12px 32px;
                  background: linear-gradient(90deg, #00A651, #28a745);
                  color: white;
                  text-decoration: none;
                  border-radius: 8px;
                  font-size: 16px;
                  font-weight: 600;
                  transition: transform 0.2s, box-shadow 0.2s;
              }
              .btn:hover {
                  transform: scale(1.05);
                  box-shadow: 0 4px 12px rgba(0, 166, 81, 0.3);
              }
              @media (max-width: 480px) {
                  .container {
                      padding: 40px 20px;
                      max-width: 90%;
                  }
                  h1 {
                      font-size: 24px;
                  }
                  p {
                      font-size: 14px;
                  }
                  .checkmark-container {
                      width: 100px;
                      height: 100px;
                  }
                  .checkmark {
                      font-size: 50px;
                  }
              }
              @keyframes scaleIn {
                  from { opacity: 0; transform: scale(0.95); }
                  to { opacity: 1; transform: scale(1); }
              }
              @keyframes pulse {
                  0% { transform: scale(1); }
                  50% { transform: scale(1.05); }
                  100% { transform: scale(1); }
              }
          </style>
      </head> 
      <body>
          <div class="container">
              <div class="checkmark-container">
                  <div class="checkmark">✔</div>
              </div>
              <h1>Payment Successful!</h1>
              <p>Your payment has been processed successfully via eSewa.</p>
              <div class="transaction-details">
                  <p>Amount Paid: <span>${paidFeesData.totalPrice}</span></p>
                  <p>Transaction ID: <span>${paymentInfo.decodedData.transaction_code}</span></p>
              </div>
              <!-- <img src="https://esewa.com.np/images/logo.png" alt="eSewa Logo" style="width: 100px; margin-bottom: 20px;"> -->
              <a href="/" class="btn">Return to Home</a>
          </div>
          <script>
              console.log("Payment success page loaded");
          </script>
      </body>
      </html>
      `);
  } catch (error) {
    res.status(500).json({ success: false, message: "An error occurred during payment verification", error: error.message });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Fetch payment history with related Fee details and Payment details
    const paymentHistory = await PaidFees.findAll({
      where: { 
        user_id: userId,
      },
      include: [
        {
          model: Fee,
          attributes: ['feeType', 'feeDescription', 'feeAmount', 'dueDate']
        },
        {
          model: Payment,
          attributes: ['transactionId', 'amount', 'paymentDate', 'status']
        }
      ],
      order: [['createdAt', 'DESC']], // Most recent payments first
    });

    if (!paymentHistory || paymentHistory.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payment history found"
      });
    }

    res.status(200).json({
      success: true,
      paymentHistory
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment history",
      error: error.message
    });
  }
};

module.exports = {
  initializePayment,
  completePayment,
  getPaymentHistory
};