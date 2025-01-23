const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Adjust path to your user model

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
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure the secret is set in your environment variables
        console.log("Decoded token:", decoded); // Log the decoded token

        // Fetch the user by ID and attach it to req.user
        const user = await User.findByPk(decoded.user_id); // Adjust the key to match your token's payload

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

module.exports = authenticateUser;

