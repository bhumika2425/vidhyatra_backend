const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventsByDate } = require('../controller/eventController');
const authenticateUser = require('../middleware/auth');

// Routes
router.post('/postEvents', authenticateUser, createEvent);          // Admin: Create an event
router.get('/getEvents', authenticateUser, getEvents);            // User: Get all events
router.get('/getEventsByDate/:date', authenticateUser, getEventsByDate); // User: Get events for a specific date

module.exports = router;
