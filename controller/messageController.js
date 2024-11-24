// econtroller/messageController.js
const messageService = require('../services/messageService');

// Controller to send a message
const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, message } = req.body;
        const newMessage = await messageService.sendMessage(senderId, receiverId, message);
        return res.status(201).json(newMessage);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to send message', details: error.message });
    }
};

// Controller to get all messages between two users
const getMessages = async (req, res) => {
    try {
        const { senderId, receiverId } = req.query;
        const messages = await messageService.getMessages(senderId, receiverId);
        return res.json(messages);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
    }
};

module.exports = {
    sendMessage,
    getMessages
};
