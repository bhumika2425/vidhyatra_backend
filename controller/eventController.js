const Event = require('../models/eventModel');

// Admin: Post a new event
exports.createEvent = async (req, res) => {
    const { title, description, date } = req.body;

    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Only admins can post events.' });
        }

        const newEvent = await Event.create({
            title,
            description,
            date,
            created_by: req.user.user_id,
        });

        res.status(201).json({ message: 'Event created successfully.', event: newEvent });
    } catch (error) {
        res.status(500).json({ message: 'Error creating event.', error: error.message });
    }
};

// Users: Get all events
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.findAll({
            order: [['date', 'ASC']], // Sort events by date
        });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events.', error: error.message });
    }
};

// Users: Get events for a specific date
exports.getEventsByDate = async (req, res) => {
    const { date } = req.params;

    try {
        const events = await Event.findAll({ where: { date } });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events for the date.', error: error.message });
    }
};
