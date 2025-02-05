//controller/friendRequestController.js
const { sendRequest, getRequests, respondToRequest } = require('../services/friendRequestService');

// Function to send a friend request
const sendFriendRequest = async (req, res) => {
    try {
        const { sender_id, receiver_id } = req.body;
        const { request, sender_email, sender_name } = await sendRequest(sender_id, receiver_id);  // Destructure correctly
        res.status(201).json({
            message: 'Friend request sent successfully',
            request,  // Return the request data
            sender_email,  // Return sender's email
            sender_name
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function to get friend requests for a specific user
const getFriendRequests = async (req, res) => {
    try {
        const { userId } = req.params;
        const requests = await getRequests(userId);
        res.status(200).json({ requests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Function to respond to a friend request
const respondToFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body; // "accepted" or "rejected"
        const updatedRequest = await respondToRequest(requestId, status);
        res.status(200).json({ message: `Friend request ${status} successfully`, updatedRequest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { sendFriendRequest, getFriendRequests, respondToFriendRequest };
