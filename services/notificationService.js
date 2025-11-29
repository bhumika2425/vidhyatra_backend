const Notification = require('../models/notification');
const User = require('../models/user');
const FCMService = require('./fcmService');

class NotificationService {
    constructor() {
        this.io = null;
    }

    setSocketIO(io) {
        this.io = io;
    }

    /**
     * Send notification to a specific user
     * @param {number} userId - Target user ID
     * @param {Object} notificationData - Notification details
     * @param {boolean} saveToDb - Whether to save to database (default: true)
     */
    async sendToUser(userId, notificationData, saveToDb = true) {
        try {
            console.log(`📤 NotificationService.sendToUser() - userId: ${userId}, saveToDb: ${saveToDb}`);
            console.log(`📋 NotificationService.sendToUser() - notificationData:`, notificationData);
            
            let notification = null;

            // Save to database if required
            if (saveToDb) {
                console.log(`💾 NotificationService.sendToUser() - Saving notification to database`);
                notification = await Notification.create({
                    user_id: userId,
                    title: notificationData.title,
                    message: notificationData.message,
                    type: notificationData.type,
                    priority: notificationData.priority || 'MEDIUM',
                    data: notificationData.data || null,
                    expires_at: notificationData.expires_at || null
                });
                console.log(`✅ NotificationService.sendToUser() - Notification saved to DB with ID: ${notification.notification_id}`);
            } else {
                console.log(`⚠️ NotificationService.sendToUser() - Skipping database save`);
            }

            // Send real-time notification if Socket.IO is available
            if (this.io) {
                console.log(`🔌 NotificationService.sendToUser() - Socket.IO available, preparing real-time notification`);
                const notificationPayload = {
                    id: notification ? notification.notification_id : Date.now(),
                    title: notificationData.title,
                    message: notificationData.message,
                    type: notificationData.type,
                    priority: notificationData.priority || 'MEDIUM',
                    data: notificationData.data || null,
                    timestamp: new Date().toISOString(),
                    isRead: false
                };
                
                console.log(`📋 NotificationService.sendToUser() - Notification payload:`, notificationPayload);
                console.log(`🎯 NotificationService.sendToUser() - Sending to room: user_${userId}`);
                this.io.to(`user_${userId}`).emit('notification', notificationPayload);
                console.log(`✅ NotificationService.sendToUser() - Notification sent to user ${userId}: ${notificationData.title}`);
            } else {
                console.log(`❌ NotificationService.sendToUser() - Socket.IO not available, cannot send real-time notification`);
            }

            // Send FCM push notification
            try {
                console.log(`📱 NotificationService.sendToUser() - Attempting to send FCM notification`);
                const user = await User.findByPk(userId);
                
                if (user && user.fcmToken) {
                    console.log(`📱 NotificationService.sendToUser() - User has FCM token, sending push notification`);
                    const fcmResult = await FCMService.sendToDevice(user.fcmToken, {
                        title: notificationData.title,
                        body: notificationData.message,
                        type: notificationData.type,
                        data: {
                            notification_id: notification ? notification.notification_id.toString() : '',
                            type: notificationData.type,
                            ...(notificationData.data || {})
                        }
                    });

                    if (fcmResult.success) {
                        console.log(`✅ NotificationService.sendToUser() - FCM notification sent successfully`);
                    } else if (fcmResult.shouldRemove) {
                        console.log(`⚠️ NotificationService.sendToUser() - Invalid FCM token, removing from user`);
                        await User.update({ fcmToken: null }, { where: { user_id: userId } });
                    } else {
                        console.log(`❌ NotificationService.sendToUser() - FCM send failed:`, fcmResult.error);
                    }
                } else {
                    console.log(`⚠️ NotificationService.sendToUser() - User has no FCM token`);
                }
            } catch (fcmError) {
                console.error(`❌ NotificationService.sendToUser() - FCM error:`, fcmError.message);
                // Don't throw error, continue with the notification flow
            }

            return notification;
        } catch (error) {
            console.error(`❌ NotificationService.sendToUser() - Error sending notification to user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Send notification to multiple users
     * @param {Array} userIds - Array of user IDs
     * @param {Object} notificationData - Notification details
     */
    async sendToMultipleUsers(userIds, notificationData) {
        try {
            console.log(`📤 NotificationService.sendToMultipleUsers() - userIds:`, userIds);
            console.log(`📋 NotificationService.sendToMultipleUsers() - notificationData:`, notificationData);
            const notifications = [];
            
            for (const userId of userIds) {
                const notification = await this.sendToUser(userId, notificationData, true);
                notifications.push(notification);
            }

            return notifications;
        } catch (error) {
            console.error('Error sending notifications to multiple users:', error);
            throw error;
        }
    }

    /**
     * Send notification to all users with a specific role
     * @param {string} role - User role ('Student', 'Teacher', 'Admin')
     * @param {Object} notificationData - Notification details
     */
    async sendToRole(role, notificationData) {
        try {
            const users = await User.findAll({
                where: { role: role },
                attributes: ['user_id']
            });

            const userIds = users.map(user => user.user_id);
            
            // Send real-time notification to role room
            if (this.io) {
                const notificationPayload = {
                    id: Date.now(),
                    title: notificationData.title,
                    message: notificationData.message,
                    type: notificationData.type,
                    priority: notificationData.priority || 'MEDIUM',
                    data: notificationData.data || null,
                    timestamp: new Date().toISOString(),
                    isRead: false
                };

                this.io.to(`role_${role.toLowerCase()}`).emit('notification', notificationPayload);
            }

            return await this.sendToMultipleUsers(userIds, notificationData);
        } catch (error) {
            console.error(`Error sending notifications to role ${role}:`, error);
            throw error;
        }
    }

    /**
     * Broadcast notification to all connected users
     * @param {Object} notificationData - Notification details
     */
    async broadcastToAll(notificationData) {
        try {
            console.log(`📢 NotificationService.broadcastToAll() - Broadcasting notification`);
            console.log(`📋 NotificationService.broadcastToAll() - notificationData:`, notificationData);
            
            if (this.io) {
                console.log(`🔌 NotificationService.broadcastToAll() - Socket.IO available, preparing broadcast`);
                const notificationPayload = {
                    id: Date.now(),
                    title: notificationData.title,
                    message: notificationData.message,
                    type: notificationData.type,
                    priority: notificationData.priority || 'MEDIUM',
                    data: notificationData.data || null,
                    timestamp: new Date().toISOString(),
                    isRead: false
                };

                console.log(`📋 NotificationService.broadcastToAll() - Payload:`, notificationPayload);
                this.io.emit('notification', notificationPayload);
                console.log(`✅ NotificationService.broadcastToAll() - Broadcast sent to all connected users`);
                console.log(`📢 Broadcast notification: ${notificationData.title}`);
            }

            // Also save to all users in database if needed
            const users = await User.findAll({ attributes: ['user_id'] });
            const userIds = users.map(user => user.user_id);
            
            return await this.sendToMultipleUsers(userIds, notificationData);
        } catch (error) {
            console.error('Error broadcasting notification:', error);
            throw error;
        }
    }

    /**
     * Get user's notifications with pagination
     * @param {number} userId - User ID
     * @param {number} page - Page number (default: 1)
     * @param {number} limit - Items per page (default: 20)
     */
    async getUserNotifications(userId, page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            
            const notifications = await Notification.findAndCountAll({
                where: { user_id: userId },
                order: [['created_at', 'DESC']],
                limit,
                offset
            });

            return {
                notifications: notifications.rows,
                totalCount: notifications.count,
                totalPages: Math.ceil(notifications.count / limit),
                currentPage: page,
                hasNextPage: page < Math.ceil(notifications.count / limit),
                hasPrevPage: page > 1
            };
        } catch (error) {
            console.error('Error fetching user notifications:', error);
            throw error;
        }
    }

    /**
     * Get unread notification count for user
     * @param {number} userId - User ID
     */
    async getUnreadCount(userId) {
        try {
            return await Notification.getUnreadCount(userId);
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }

    /**
     * Mark notification as read
     * @param {number} notificationId - Notification ID
     * @param {number} userId - User ID (for security)
     */
    async markAsRead(notificationId, userId) {
        try {
            const notification = await Notification.findOne({
                where: {
                    notification_id: notificationId,
                    user_id: userId
                }
            });

            if (!notification) {
                throw new Error('Notification not found');
            }

            await notification.markAsRead();
            
            // Emit read status update to user
            if (this.io) {
                this.io.to(`user_${userId}`).emit('notification_read', {
                    notificationId: notificationId
                });
            }

            return notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read for a user
     * @param {number} userId - User ID
     */
    async markAllAsRead(userId) {
        try {
            await Notification.markAllAsRead(userId);
            
            // Emit all read status update to user
            if (this.io) {
                this.io.to(`user_${userId}`).emit('all_notifications_read');
            }

            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    /**
     * Delete old notifications (cleanup)
     * @param {number} daysOld - Delete notifications older than this many days
     */
    async cleanupOldNotifications(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const deletedCount = await Notification.destroy({
                where: {
                    created_at: {
                        [require('sequelize').Op.lt]: cutoffDate
                    },
                    is_read: true // Only delete read notifications
                }
            });

            console.log(`🧹 Cleaned up ${deletedCount} old notifications`);
            return deletedCount;
        } catch (error) {
            console.error('Error cleaning up old notifications:', error);
            throw error;
        }
    }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;
