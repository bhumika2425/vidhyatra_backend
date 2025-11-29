const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Adjust path to your model
const Admin = require('../models/adminModel');

// Define authenticateUser
const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log("Auth Header");

    // Check if the Authorization header is present and correctly formatted
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("Auth header missing or incorrect.");
        return res.status(403).json({ message: 'No token provided or invalid token format.' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from the header

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure the secret is set in environment variables
        console.log("Decoded token:", decoded); // Log the decoded token

        // Fetch the user by ID and attach it to req.user
        const user = await User.findByPk(decoded.user_id); // Adjust the key to match token's payload

        if (!user) {
            console.log("User not found.");
            return res.status(404).json({ message: 'User not found.' });
        }

        console.log("Authentication successful");

        req.user = user; // Attach user data to the request object

        // Log the authenticated user's ID for debugging
        console.log("Authenticated user ID:", req.user.user_id);

        next(); // Proceed to the next middleware or controller
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
    }
};

const authenticateAdmin = async (req, res, next) => {
    // TEMPORARY: Allow requests without authentication for testing
    // TODO: Remove this bypass after implementing proper admin login
    if (process.env.NODE_ENV === 'development' && !req.headers.authorization) {
        console.log('⚠️ WARNING: Admin authentication bypassed for development');
        req.user = { user_id: 1, isAdmin: true }; // Mock admin user
        return next();
    }

    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'No token provided or invalid format' });
    }
  
    const token = authHeader.split(' ')[1];
  
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if it's a user (not separate admin table)
        const user = await User.findByPk(decoded.user_id);
  
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has admin privileges
        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
  
        req.user = user;
        next();
    } catch (error) {
        console.error('Token error:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

const authenticateUserOrAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ message: 'No token provided or invalid token format.' });
    }
  
    const token = authHeader.split(' ')[1];
  
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Try authenticating as a user first
      if (decoded.user_id) {
        const user = await User.findByPk(decoded.user_id);
        if (!user) {
          return res.status(404).json({ message: 'User not found.' });
        }
        req.user = user;
        req.isAdmin = user.isAdmin === true;
        console.log('Authenticated as User:', req.user.user_id, 'isAdmin:', req.isAdmin);
        return next();
      }
  
      // If no user_id, try authenticating as an admin
      if (decoded.admin_id) {
        const admin = await Admin.findByPk(decoded.admin_id);
        if (!admin) {
          return res.status(404).json({ message: 'Admin not found.' });
        }
        req.admin = admin;
        req.isAdmin = true; // Flag to indicate admin
        console.log('Authenticated as Admin:', req.admin.admin_id);
        return next();
      }
  
      // If neither user_id nor admin_id is in the token
      return res.status(401).json({ message: 'Invalid token payload.' });
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
    }
};

module.exports = {authenticateUser, authenticateAdmin, authenticateUserOrAdmin};