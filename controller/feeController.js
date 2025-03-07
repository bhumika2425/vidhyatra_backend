const Fee = require("../models/fee");
const User = require("../models/user");

// Add a new fee (Admin only)
const addFee = async (req, res) => {
  try {
    const { feeType, feeDescription, feeAmount, dueDate } = req.body;

    // Ensure that the authenticated user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Only admins can add fees." });
    }

    // Create the fee record
    const fee = await Fee.create({ 
      user_id: req.user.user_id, // Use the college_id from the authenticated user
      feeType, 
      feeDescription, 
      feeAmount, 
      dueDate 
    });

    res.status(201).json({ message: "Fee added successfully", fee });
  } catch (error) {
    console.error("Error adding fee:", error);
    res.status(500).json({ message: "An internal server error occurred. Please try again later.", error: error.message });
  }
};

// // Get all fees (Anyone can access)
// const getFees = async (req, res) => {
//   try {
//     const fees = await Fee.findAll({ include: { model: User, attributes: ["name", "email"] } });
//     res.status(200).json(fees);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getFees = async (req, res) => {
    try {
      // Debugging: Log request body or params (if necessary)
      console.log("Request Data:", req.body); // Logs the request data (if needed)
  
      // Debugging: Log the SQL query being executed
      console.log("Executing query to fetch fees with associated users...");
  
      const fees = await Fee.findAll({
        include: {
          model: User,
          attributes: ["name", "email"], // Get only name and email from the User model
          required: true,  // This ensures that only fees with associated users are returned
        },
      });
  
      // Debugging: Log the result returned by the query
      console.log("Fees Retrieved:", fees);
  
      if (fees.length === 0) {
        console.log("No fees found with associated users.");
      }
  
      res.status(200).json(fees);
    } catch (error) {
      // Debugging: Log the error if something goes wrong
      console.error("Error fetching fees:", error);
  
      res.status(500).json({ error: error.message });
    }
  };

// Get a single fee by ID (Anyone can access)
const getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findByPk(req.params.id, { include: User });
    if (!fee) return res.status(404).json({ message: "Fee not found" });
    res.status(200).json(fee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const updateFee = async (req, res) => {
    try {
      const { feeType, feeDescription, feeAmount, dueDate } = req.body;
  
      // Debugging: Log the incoming request body
      console.log("Request Body:", req.body);
  
      // Ensure that the authenticated user is an admin
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied. Only admins can update fees." });
      }
  
      const fee = await Fee.findByPk(req.params.id);
      if (!fee) return res.status(404).json({ message: "Fee not found" });
  
      // Dynamically build the object to update only the fields that are present in the request body
      const updatedData = {};
      if (feeType) updatedData.feeType = feeType;
      if (feeDescription) updatedData.feeDescription = feeDescription;
      if (feeAmount) updatedData.feeAmount = feeAmount;
      if (dueDate) updatedData.dueDate = dueDate;
  
      // Debugging: Log the updatedData object before applying the update
      console.log("Updated Data:", updatedData);
  
      // Perform the update operation
      await fee.update(updatedData);
  
      // Debugging: Log the updated fee after the update operation
      const updatedFee = await Fee.findByPk(req.params.id);  // Fetch the updated fee from the database
      console.log("Updated Fee:", updatedFee);
  
      res.status(200).json({ message: "Fee updated successfully", fee: updatedFee });
    } catch (error) {
      // Debugging: Log the error if something goes wrong
      console.error("Error updating fee:", error);
  
      res.status(500).json({ error: error.message });
    }
  };
  

// Delete a fee (Admin only)
const deleteFee = async (req, res) => {
  try {
    // Ensure that the authenticated user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Only admins can delete fees." });
    }

    const fee = await Fee.findByPk(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee not found" });

    await fee.destroy();
    res.status(200).json({ message: "Fee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addFee,
  getFees,
  getFeeById,
  updateFee,
  deleteFee,
};
