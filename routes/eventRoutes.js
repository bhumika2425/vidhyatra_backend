const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventsByDate } = require('../controller/eventController');
const auth = require('../middleware/auth');

// Routes
router.post('/events', auth, createEvent);          // Admin: Create an event
router.get('/events', auth, getEvents);            // User: Get all events
router.get('/events/:date', auth, getEventsByDate); // User: Get events for a specific date

module.exports = router;
