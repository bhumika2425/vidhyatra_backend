const Fee = require("../models/fee");
const User = require("../models/user");
const Admin = require("../models/adminModel");

// Add a new fee (Admin only)
const addFee = async (req, res) => {
  try {
    const { feeType, feeDescription, feeAmount, dueDate } = req.body;

    // // Ensure that the authenticated user is an admin
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ message: "Access denied. Only admins can add fees." });
    // }

    // Create the fee record
    const fee = await Fee.create({ 
      admin_id: req.admin.admin_id, // Use the college_id from the authenticated user
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
    
  
      const fees = await Fee.findAll({});
  
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

        // Input validation
        if (feeAmount && isNaN(feeAmount)) {
            return res.status(400).json({ message: "Fee amount must be a valid number" });
        }

        if (dueDate && isNaN(Date.parse(dueDate))) {
            return res.status(400).json({ message: "Invalid due date format" });
        }

        // Find the fee and include admin info to verify ownership
        const fee = await Fee.findByPk(req.params.id, {
            include: [{ model: Admin, attributes: ["admin_id", "name", "email"] }]
        });

        if (!fee) {
            return res.status(404).json({ message: "Fee not found" });
        }

        // Verify that the fee belongs to the admin making the request
        if (fee.admin_id !== req.admin.admin_id) {
            return res.status(403).json({ message: "Access denied. You can only update fees that you created." });
        }

        // Dynamically build the object to update only the fields that are present in the request body
        const updatedData = {};
        if (feeType) updatedData.feeType = feeType.trim();
        if (feeDescription) updatedData.feeDescription = feeDescription.trim();
        if (feeAmount) updatedData.feeAmount = parseFloat(feeAmount);
        if (dueDate) updatedData.dueDate = new Date(dueDate);

        // Check if any data was provided to update
        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ message: "No valid fields provided for update" });
        }

        // Perform the update operation
        await fee.update(updatedData);

        // Get the updated fee with admin details
        const updatedFee = await Fee.findByPk(req.params.id, {
            include: { model: Admin, attributes: ["name", "email"] }
        });

        res.status(200).json({
            message: "Fee updated successfully",
            fee: updatedFee
        });

    } catch (error) {
        console.error("Error updating fee:", error);
        
        // Handle specific error cases
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Validation error",
                errors: error.errors.map(e => ({ field: e.path, message: e.message }))
            });
        }
        
        if (error.name === "SequelizeDatabaseError") {
            return res.status(400).json({ message: "Invalid data provided for update" });
        }

        res.status(500).json({ message: "An error occurred while updating the fee" });
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
