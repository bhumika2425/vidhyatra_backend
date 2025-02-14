//service/friendRequestService.js

const FriendRequest = require('../models/friendRequestModel');
const { Op } = require('sequelize');
const Friend = require('../models/friend');
const User = require('../models/user');


const sendRequest = async (sender_id, receiver_id) => {
    // Check if they are already friends
    const existingFriendship = await Friend.findOne({
        where: {
            [Op.or]: [
                { user1_id: sender_id, user2_id: receiver_id },
                { user1_id: receiver_id, user2_id: sender_id } // Check both directions
            ]
        }
    });

    if (existingFriendship) {
        throw new Error('You are already friends with this user.');
    }

    // Check if a request already exists in either direction (pending or accepted)
    const existingRequest = await FriendRequest.findOne({
        where: {
            [Op.or]: [
                { sender_id, receiver_id },
                { sender_id: receiver_id, receiver_id: sender_id }
            ]
        }
    });

    if (existingRequest) {
        throw new Error('A friend request already exists between these users.');
    }

    // Create a new friend request
    const request = await FriendRequest.create({ sender_id, receiver_id, status: 'pending' });

    // Fetch the sender's email
    const sender = await User.findByPk(sender_id);  // Assuming you have a User model
    if (!sender) {
        throw new Error('Sender not found');
    }

    return { request, sender_email: sender.email, sender_name: sender.name };
};

// Function to get friend requests for a specific user
const getRequests = async (userId) => {
    const requests = await FriendRequest.findAll({
        where: { receiver_id: userId, status: 'pending' },
    });

    // Fetch the sender's email and name for each request
    const requestsWithSenderInfo = await Promise.all(requests.map(async (request) => {
        const sender = await User.findByPk(request.sender_id);  // Fetch sender's details
        if (sender) {
            return {
                ...request.toJSON(),
                sender_email: sender.email,
                sender_name: sender.name,
                sender_role: sender.role
            };
        }
        return request;
    }));

    return requestsWithSenderInfo;
};

// Function to respond to a friend request
const respondToRequest = async (requestId, status) => {
    if (!['accepted', 'rejected'].includes(status)) {
        throw new Error('Invalid status.');
    }

    // Find the friend request
    const request = await FriendRequest.findByPk(requestId);
    if (!request) {
        throw new Error('Friend request not found.');
    }

    if (status === 'accepted') {
        // Create a new friendship in the `friends` table
        await Friend.create({
            user1_id: request.sender_id,
            user2_id: request.receiver_id,
        });

        // Optionally, delete the friend request after accepting
        await request.destroy();

        return { message: 'Friend request accepted, friendship created.' };
    } else {
        // Update the request status if rejected
        request.status = 'rejected';
        await request.save();
        return { message: 'Friend request rejected.' };
    }
};

module.exports = { sendRequest, getRequests, respondToRequest };
