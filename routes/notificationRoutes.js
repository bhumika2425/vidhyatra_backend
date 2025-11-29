const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { authenticateUser, authenticateAdmin, authenticateUserOrAdmin } = require('../middleware/auth');
const { notificationRateLimiter } = require('../middleware/rateLimiter');

// Apply rate limiter to all notification routes
router.use(notificationRateLimiter);

// Validation middleware
const validateSendNotification = [
    body('title').notEmpty().trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be between 1-255 characters'),
    body('message').notEmpty().trim().isLength({ min: 1, max: 1000 }).withMessage('Message is required and must be between 1-1000 characters'),
    body('type').isIn([
        'BLOG_POST', 'FRIEND_REQUEST', 'EVENT_REMINDER', 'FEE_REMINDER', 
        'DEADLINE_ALERT', 'APPOINTMENT_CONFIRMATION', 'ACADEMIC_UPDATE', 
        'SYSTEM_ANNOUNCEMENT', 'LOST_AND_FOUND'
    ]).withMessage('Invalid notification type'),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority level')
];

const validateSendToUser = [
    ...validateSendNotification,
    body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required')
];

const validateSendToMultipleUsers = [
    ...validateSendNotification,
    body('userIds').isArray({ min: 1 }).withMessage('User IDs array is required'),
    body('userIds.*').isInt({ min: 1 }).withMessage('Each user ID must be a valid integer')
];

const validateSendToRole = [
    ...validateSendNotification,
    body('role').isIn(['Student', 'Teacher', 'Admin']).withMessage('Valid role is required')
];

// User routes (authenticated users)
router.get('/my-notifications', authenticateUser, notificationController.getUserNotifications);
router.get('/unread-count', authenticateUser, notificationController.getUnreadCount);
router.patch('/mark-read/:id', authenticateUser, notificationController.markAsRead);
router.patch('/mark-all-read', authenticateUser, notificationController.markAllAsRead);

// Admin routes (admin only)
router.post('/send-to-user', authenticateUserOrAdmin, validateSendToUser, notificationController.sendToUser);
router.post('/send-to-multiple', authenticateUserOrAdmin, validateSendToMultipleUsers, notificationController.sendToMultipleUsers);
router.post('/send-to-role', authenticateUserOrAdmin, validateSendToRole, notificationController.sendToRole);
router.post('/broadcast', authenticateUserOrAdmin, validateSendNotification, notificationController.broadcastToAll);

// Test route (authenticated users)
router.post('/test', authenticateUser, notificationController.testNotification);

module.exports = router;
