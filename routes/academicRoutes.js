const express = require('express');
const router = express.Router();
const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent
} = require('../controller/academicController');
const {
    authenticateAdmin,
    authenticateUserOrAdmin
} = require('../middleware/auth');

// Admin routes
router.post('/events', authenticateAdmin, createEvent);           // Create exam/holiday event
router.put('/events/:id', authenticateAdmin, updateEvent);        // Update exam/holiday event
router.delete('/events/:id', authenticateAdmin, deleteEvent);     // Delete exam/holiday event

// User & Admin routes
router.get('/events', authenticateUserOrAdmin, getEvents);        // Get all events with filters
router.get('/events/:id', authenticateUserOrAdmin, getEventById); // Get specific event by ID

module.exports = router;