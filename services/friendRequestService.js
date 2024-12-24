//service/friendRequestService.js

const FriendRequest = require('../models/friendRequestModel');

// Function to send a friend request
const sendRequest = async (senderId, receiverId) => {
    const existingRequest = await FriendRequest.findOne({
        where: { sender_id: senderId, receiver_id: receiverId },
    });

    if (existingRequest) {
        throw new Error('Friend request already sent.');
    }

    return await FriendRequest.create({ sender_id: senderId, receiver_id: receiverId });
};

// Function to get friend requests for a specific user
const getRequests = async (userId) => {
    return await FriendRequest.findAll({
        where: { receiver_id: userId, status: 'pending' },
    });
};

// Function to respond to a friend request
const respondToRequest = async (requestId, status) => {
    if (!['accepted', 'rejected'].includes(status)) {
        throw new Error('Invalid status.');
    }

    const request = await FriendRequest.findByPk(requestId);
    if (!request) {
        throw new Error('Friend request not found.');
    }

    request.status = status;
    return await request.save();
};

module.exports = { sendRequest, getRequests, respondToRequest };
