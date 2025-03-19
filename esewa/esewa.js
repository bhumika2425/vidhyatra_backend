
//esewa/esewa.js
const axios = require("axios");
const crypto = require("crypto");

const getEsewaPaymentHash = async ({ amount, transaction_uuid }) => {
  try {

    // Ensure total_amount is formatted consistently by removing commas
    const formattedAmount = String(amount).replace(/,/g, "");  // Remove all commas

      // Construct the data string as per eSewa's requirements
      const data = `total_amount=${formattedAmount},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE}`;
      
      // Log the data you're signing
      console.log("Data to be signed:", data);
  
      const secretKey = process.env.ESEWA_SECRET_KEY;
      const hash = crypto
        .createHmac("sha256", secretKey)
        .update(data)
        .digest("base64");
  
      // Log the generated hash
      console.log("Generated hash (signature):", hash);
  
      return {
          signature: hash,
          signed_field_names: "total_amount,transaction_uuid,product_code",
      };
  } catch (error) {
      console.error("Error in generating eSewa payment hash:", error);
      throw error;
  }
};

const verifyEsewaPayment = async (encodedData) => {
    try {
        console.log("Received Encoded Data:", encodedData); // Debugging log
        
        // Decode the base64 data received from eSewa
        let decodedData = atob(encodedData);
        console.log("Base64 Decoded Data:", decodedData); // Debugging log

        decodedData = JSON.parse(decodedData);
        console.log("Parsed JSON Data:", decodedData); // Debugging log

        // Ensure consistency: Remove commas from total_amount before comparison
        const formattedAmount = decodedData.total_amount.replace(/,/g, "");  // Remove commas here as well
        
        // Validate required fieldss
        const requiredFields = ['transaction_code', 'status', 'total_amount', 'transaction_uuid', 'signature'];
        let missingFields = [];

        requiredFields.forEach(field => {
            if (!decodedData[field]) {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            console.error("Missing required fields:", missingFields); // Debugging log
            throw { message: "Missing required fields", missingFields, decodedData };
        }

        let headersList = {
            Accept: "application/json",
            "Content-Type": "application/json",
        };

        // Construct the data string for signature verification
        const data = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${formattedAmount},transaction_uuid=${decodedData.transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE},signed_field_names=${decodedData.signed_field_names}`;
        console.log("Data String for Signature Verification:", data); // Debugging log

        // Generate the hash to compare with eSewa's signature
        const secretKey = process.env.ESEWA_SECRET_KEY;
        if (!secretKey) {
            console.error("Secret Key is missing in environment variables");
            throw { message: "Server configuration error: Missing secret key" };
        }

        const hash = crypto.createHmac("sha256", secretKey).update(data).digest("base64");
        console.log("Generated Hash (for verification):", hash); // Debugging log
        console.log("Signature from eSewa:", decodedData.signature); // Debugging log

        // Compare the generated hash with the received signature
        if (hash !== decodedData.signature) {
            console.error("Signature Mismatch Detected!"); // Debugging log
            throw { message: "Invalid Signature", decodedData };
        } else {
            console.log("Signature Verification Successful ✅"); // Debugging log
        }

        // Construct the URL for verifying the transaction status
        const esewaUrl = `${process.env.ESEWA_GATEWAY_URL}/api/epay/transaction/status/?product_code=${process.env.ESEWA_PRODUCT_CODE}&total_amount=${formattedAmount}&transaction_uuid=${decodedData.transaction_uuid}`;
        console.log("eSewa Transaction Status URL:", esewaUrl); // Debugging log

        let reqOptions = {
            url: esewaUrl,
            method: "GET",
            headers: headersList,
        };

        console.log("Sending request to eSewa for transaction status check..."); // Debugging log
        let response = await axios.request(reqOptions);
        console.log("eSewa Payment Status Response:", response.data); // Debugging log

        // Validate response from eSewa
        if (!response.data || response.status !== 200) {
            console.error("Invalid response received from eSewa");
            throw { message: "eSewa response error", response: response.data };
        }

        // Validate transaction details
        if (
            response.data.status !== "COMPLETE" ||
            response.data.transaction_uuid !== decodedData.transaction_uuid ||
            Number(response.data.total_amount) !== Number(formattedAmount)
        ) {
            console.error("Payment Verification Failed! ❌"); // Debugging log
            console.error("Expected Transaction UUID:", decodedData.transaction_uuid);
            console.error("Received Transaction UUID:", response.data.transaction_uuid);
            console.error("Expected Amount:", formattedAmount);
            console.error("Received Amount:", response.data.total_amount);
            throw { message: "Payment verification failed", decodedData, response: response.data };
        }

        console.log("Payment Verified Successfully ✅"); // Debugging log
        return { response: response.data, decodedData };

    } catch (error) {
        console.error("Error in verifying eSewa payment:", error);
        throw error;
    }
};


  module.exports = { verifyEsewaPayment, getEsewaPaymentHash };