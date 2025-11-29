const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK (only if not already initialized)
if (!admin.apps.length) {
    const serviceAccount = require(path.join(__dirname, '../config/vidhyatra-firebase-adminsdk.json'));
    
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Firebase Admin SDK initialized');
}

class FCMService {
    /**
     * Send push notification to a single device
     * @param {string} fcmToken - Device FCM token
     * @param {object} notification - {title, body, data}
     */
    static async sendToDevice(fcmToken, notification) {
        try {
            if (!fcmToken || fcmToken.trim() === '') {
                console.log('⚠️ No FCM token provided');
                return { success: false, error: 'NO_TOKEN' };
            }

            const message = {
                token: fcmToken,
                notification: {
                    title: notification.title,
                    body: notification.body || notification.message,
                },
                data: {
                    type: notification.type || 'SYSTEM_ANNOUNCEMENT',
                    // Convert all data values to strings (FCM requirement)
                    ...Object.entries(notification.data || {}).reduce((acc, [key, value]) => {
                        acc[key] = String(value);
                        return acc;
                    }, {}),
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                },
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        channelId: 'high_importance_channel',
                        color: '#2196F3',
                        icon: 'ic_notification',
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                            contentAvailable: true,
                        }
                    }
                }
            };

            const response = await admin.messaging().send(message);
            console.log('✅ FCM notification sent successfully:', response);
            return { success: true, messageId: response };
        } catch (error) {
            console.error('❌ FCM send error:', error.message);
            
            // Handle invalid token
            if (error.code === 'messaging/invalid-registration-token' || 
                error.code === 'messaging/registration-token-not-registered') {
                console.log('⚠️ Invalid FCM token, should be removed from database');
                return { success: false, error: 'INVALID_TOKEN', shouldRemove: true };
            }
            
            return { success: false, error: error.message };
        }
    }

    /**
     * Send push notification to multiple devices
     * @param {string[]} fcmTokens - Array of device FCM tokens
     * @param {object} notification - {title, body, data}
     */
    static async sendToMultipleDevices(fcmTokens, notification) {
        try {
            if (!fcmTokens || fcmTokens.length === 0) {
                console.log('⚠️ No FCM tokens provided');
                return { success: true, successCount: 0, failureCount: 0 };
            }

            // Filter out null/undefined/empty tokens
            const validTokens = fcmTokens.filter(token => token && token.trim().length > 0);
            
            if (validTokens.length === 0) {
                console.log('⚠️ No valid FCM tokens found');
                return { success: true, successCount: 0, failureCount: 0 };
            }

            const message = {
                notification: {
                    title: notification.title,
                    body: notification.body || notification.message,
                },
                data: {
                    type: notification.type || 'SYSTEM_ANNOUNCEMENT',
                    // Convert all data values to strings
                    ...Object.entries(notification.data || {}).reduce((acc, [key, value]) => {
                        acc[key] = String(value);
                        return acc;
                    }, {}),
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                },
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        channelId: 'high_importance_channel',
                        color: '#2196F3',
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        }
                    }
                },
                tokens: validTokens
            };

            const response = await admin.messaging().sendEachForMulticast(message);
            
            console.log(`✅ FCM sent to ${response.successCount}/${validTokens.length} devices`);
            
            if (response.failureCount > 0) {
                const invalidTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        console.error(`❌ Failed to send to token ${idx}:`, resp.error?.message);
                        if (resp.error?.code === 'messaging/invalid-registration-token' ||
                            resp.error?.code === 'messaging/registration-token-not-registered') {
                            invalidTokens.push(validTokens[idx]);
                        }
                    }
                });
                
                return {
                    success: true,
                    successCount: response.successCount,
                    failureCount: response.failureCount,
                    invalidTokens: invalidTokens,
                    responses: response.responses
                };
            }
            
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount,
                responses: response.responses
            };
        } catch (error) {
            console.error('❌ FCM multicast error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send to topic (broadcast to all subscribers)
     * @param {string} topic - Topic name (e.g., 'all_students', 'year_1')
     * @param {object} notification - {title, body, data}
     */
    static async sendToTopic(topic, notification) {
        try {
            const message = {
                topic: topic,
                notification: {
                    title: notification.title,
                    body: notification.body || notification.message,
                },
                data: {
                    type: notification.type || 'SYSTEM_ANNOUNCEMENT',
                    ...Object.entries(notification.data || {}).reduce((acc, [key, value]) => {
                        acc[key] = String(value);
                        return acc;
                    }, {}),
                    click_action: 'FLUTTER_NOTIFICATION_CLICK',
                },
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        channelId: 'high_importance_channel',
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                        }
                    }
                }
            };

            const response = await admin.messaging().send(message);
            console.log('✅ FCM topic notification sent:', response);
            return { success: true, messageId: response };
        } catch (error) {
            console.error('❌ FCM topic send error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Subscribe device to topic
     * @param {string|string[]} tokens - FCM token(s)
     * @param {string} topic - Topic name
     */
    static async subscribeToTopic(tokens, topic) {
        try {
            const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
            const validTokens = tokenArray.filter(token => token && token.trim().length > 0);
            
            if (validTokens.length === 0) {
                return { success: false, error: 'NO_VALID_TOKENS' };
            }
            
            const response = await admin.messaging().subscribeToTopic(validTokens, topic);
            console.log(`✅ Subscribed ${response.successCount} devices to topic: ${topic}`);
            return { success: true, successCount: response.successCount };
        } catch (error) {
            console.error('❌ Topic subscription error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Unsubscribe device from topic
     * @param {string|string[]} tokens - FCM token(s)
     * @param {string} topic - Topic name
     */
    static async unsubscribeFromTopic(tokens, topic) {
        try {
            const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
            const validTokens = tokenArray.filter(token => token && token.trim().length > 0);
            
            if (validTokens.length === 0) {
                return { success: false, error: 'NO_VALID_TOKENS' };
            }
            
            const response = await admin.messaging().unsubscribeFromTopic(validTokens, topic);
            console.log(`✅ Unsubscribed ${response.successCount} devices from topic: ${topic}`);
            return { success: true, successCount: response.successCount };
        } catch (error) {
            console.error('❌ Topic unsubscription error:', error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = FCMService;
