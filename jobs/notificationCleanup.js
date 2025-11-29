const cron = require('node-cron');
const notificationService = require('../services/notificationService');

// Run cleanup every day at 2 AM
cron.schedule('0 2 * * *', async () => {
    try {
        console.log('🧹 Running notification cleanup...');
        const deletedCount = await notificationService.cleanupOldNotifications(30);
        console.log(`✅ Deleted ${deletedCount} old notifications`);
    } catch (error) {
        console.error('❌ Notification cleanup failed:', error);
    }
});

module.exports = cron;
