const express = require('express');
const router = express.Router();
const { getEventCalendar, createEventCalendar} = require('../controller/eventCalendarController');

// Route to Get All Event Calendar Events
router.get('/event-calendar', getEventCalendar);

// Route to Create a New Event Calendar Event
router.post('/event-calendar', createEventCalendar);

module.exports = router;
