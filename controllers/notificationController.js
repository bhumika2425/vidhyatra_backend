const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');

class NotificationController {
    /**
     * Get user's notifications with pagination
     */
    async getUserNotifications(req, res) {
        try {
            const userId = req.user.user_id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const result = await notificationService.getUserNotifications(userId, page, limit);

            res.status(200).json({
                success: true,
                message: 'Notifications retrieved successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in getUserNotifications:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve notifications',
                error: error.message
            });
        }
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(req, res) {
        try {
            const userId = req.user.user_id;
            const count = await notificationService.getUnreadCount(userId);

            res.status(200).json({
                success: true,
                message: 'Unread count retrieved successfully',
                data: { unreadCount: count }
            });
        } catch (error) {
            console.error('Error in getUnreadCount:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve unread count',
                error: error.message
            });
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(req, res) {
        try {
            const userId = req.user.user_id;
            const notificationId = parseInt(req.params.id);

            if (!notificationId) {
                return res.status(400).json({
                    success: false,
                    message: 'Notification ID is required'
                });
            }

            await notificationService.markAsRead(notificationId, userId);

            res.status(200).json({
                success: true,
                message: 'Notification marked as read'
            });
        } catch (error) {
            console.error('Error in markAsRead:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark notification as read',
                error: error.message
            });
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(req, res) {
        try {
            const userId = req.user.user_id;
            await notificationService.markAllAsRead(userId);

            res.status(200).json({
                success: true,
                message: 'All notifications marked as read'
            });
        } catch (error) {
            console.error('Error in markAllAsRead:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark all notifications as read',
                error: error.message
            });
        }
    }

    /**
     * Send notification to specific user (Admin only)
     */
    async sendToUser(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { userId, title, message, type, priority, data, expires_at } = req.body;

            const notification = await notificationService.sendToUser(userId, {
                title,
                message,
                type,
                priority,
                data,
                expires_at
            });

            res.status(201).json({
                success: true,
                message: 'Notification sent successfully',
                data: notification
            });
        } catch (error) {
            console.error('Error in sendToUser:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send notification',
                error: error.message
            });
        }
    }

    /**
     * Send notification to multiple users (Admin only)
     */
    async sendToMultipleUsers(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { userIds, title, message, type, priority, data, expires_at } = req.body;

            const notifications = await notificationService.sendToMultipleUsers(userIds, {
                title,
                message,
                type,
                priority,
                data,
                expires_at
            });

            res.status(201).json({
                success: true,
                message: `Notification sent to ${userIds.length} users`,
                data: { count: notifications.length }
            });
        } catch (error) {
            console.error('Error in sendToMultipleUsers:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send notifications',
                error: error.message
            });
        }
    }

    /**
     * Send notification to role (Admin only)
     */
    async sendToRole(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { role, title, message, type, priority, data, expires_at } = req.body;

            const notifications = await notificationService.sendToRole(role, {
                title,
                message,
                type,
                priority,
                data,
                expires_at
            });

            res.status(201).json({
                success: true,
                message: `Notification sent to all users with role: ${role}`,
                data: { count: notifications.length }
            });
        } catch (error) {
            console.error('Error in sendToRole:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send notifications to role',
                error: error.message
            });
        }
    }

    /**
     * Broadcast notification to all users (Admin only)
     */
    async broadcastToAll(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { title, message, type, priority, data, expires_at } = req.body;

            const notifications = await notificationService.broadcastToAll({
                title,
                message,
                type,
                priority,
                data,
                expires_at
            });

            res.status(201).json({
                success: true,
                message: 'Notification broadcasted to all users',
                data: { count: notifications.length }
            });
        } catch (error) {
            console.error('Error in broadcastToAll:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to broadcast notification',
                error: error.message
            });
        }
    }

    /**
     * Test notification endpoint (Admin only)
     */
    async testNotification(req, res) {
        try {
            const testNotification = {
                title: 'Test Notification',
                message: 'This is a test notification from Vidhyatra',
                type: 'SYSTEM_ANNOUNCEMENT',
                priority: 'MEDIUM'
            };

            // Send to the requesting user
            const notification = await notificationService.sendToUser(
                req.user.user_id, 
                testNotification
            );

            res.status(200).json({
                success: true,
                message: 'Test notification sent successfully',
                data: notification
            });
        } catch (error) {
            console.error('Error in testNotification:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send test notification',
                error: error.message
            });
        }
    }
}

module.exports = new NotificationController();
