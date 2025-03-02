const Event = require('../models/eventModel');

// Admin: Post a new event
const createEvent = async (req, res) => {
    const { title, description, event_date, venue } = req.body;

    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Only admins can post events.' });
        }

        const newEvent = await Event.create({
            title,
            description,
            venue,
            event_date,
            created_by: req.user.user_id,
        });

        res.status(201).json({ message: 'Event created successfully.', event: newEvent });
    } catch (error) {
        res.status(500).json({ message: 'Error creating event.', error: error.message });
    }
};

// Users: Get all events
const getEvents = async (req, res) => {
    try {
        const events = await Event.findAll({
            order: [['event_date', 'ASC']], // Sort events by date
        });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events.', error: error.message });
    }
};

// Users: Get events for a specific date
const getEventsByDate = async (req, res) => {
    const { date } = req.params;

    try {
        const events = await Event.findAll({ where: { date } });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events for the date.', error: error.message });
    }
};

module.exports = {
    createEvent,
    getEvents,
    getEventsByDate,
};
