const express = require('express');
const messageController = require('../controller/messageController'); // Import the message controller
const router = express.Router();

// POST request to send a message
router.post('/send', messageController.sendMessage);

// GET request to fetch all messages between two users
router.get('/', messageController.getMessages);

module.exports = router;