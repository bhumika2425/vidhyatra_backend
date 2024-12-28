// controllers/eventCalendarController.js
const eventCalendarService = require('../services/eventCalendarService');

// Get All Event Calendar Events (GET request)
const getEventCalendar = async (req, res) => {
  try {
    const events = await eventCalendarService.getAllEventCalendar();
    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch event calendar events', error: error.message });
  }
};

// Create a New Event Calendar Event (POST request)
const createEventCalendar = async (req, res) => {
  try {
    const { event_type, title, event_date, description, color_code } = req.body;

    if (!event_type || !title || !event_date) {
      return res.status(400).json({ message: 'Event type, title, and event date are required!' });
    }

    const newEventData = {
      event_type,
      title,
      event_date,
      description,
      color_code,
    };

    const newEvent = await eventCalendarService.createEventCalendar(newEventData);
    return res.status(201).json({ message: 'Event calendar event created successfully', newEvent });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create event calendar event', error: error.message });
  }
};

module.exports = {
  getEventCalendar,
  createEventCalendar,
};
