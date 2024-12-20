const express = require('express');
const { sendFriendRequest, getFriendRequests, respondToFriendRequest } = require('../controller/friendRequestController');

const router = express.Router();

// Send a friend request
router.post('/friend-requests', sendFriendRequest);

// Get all friend requests for a user
router.get('/friend-requests/:userId', getFriendRequests);

// Respond to a friend request (accept/reject)
router.put('/friend-requests/:requestId', respondToFriendRequest);

module.exports = router;