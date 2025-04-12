const Admin = require('../models/adminModel'); // Adjust path
const jwt = require('jsonwebtoken');

const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find admin by email
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare plain-text password directly
    if (admin.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { admin_id: admin.admin_id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '5h' }
    );

    // Respond with token and admin details
    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        admin_id: admin.admin_id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        admin_profile_picture: admin.admin_profile_picture,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { adminLogin };