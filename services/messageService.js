const { Message } = require('../models/message'); // Sequelize model for Message

// Service to save a message
const sendMessage = async (senderId, receiverId, message) => {
    try {
        // Create a new message in the database
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });
        return newMessage;
    } catch (error) {
        throw new Error('Error saving message to the database');
    }
};

// Service to get all messages between two users
const getMessages = async (senderId, receiverId) => {
    try {
        // Retrieve all messages between the sender and receiver
        const messages = await Message.findAll({
            where: {
                senderId,
                receiverId
            },
            order: [['timestamp', 'ASC']] // Sort messages by timestamp in ascending order
        });
        return messages;
    } catch (error) {
        throw new Error('Error fetching messages from the database');
    }
};

module.exports = {
    sendMessage,
    getMessages
};
