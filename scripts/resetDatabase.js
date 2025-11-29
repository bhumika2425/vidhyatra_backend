/**
 * Database Reset Script
 * WARNING: This will DROP ALL TABLES and recreate them with fresh schema
 * USE ONLY IN DEVELOPMENT - ALL DATA WILL BE LOST!
 */

const { sequelizeVidhyatra } = require('../config/db');

// Import all models
const Admin = require('../models/adminModel');
const User = require('../models/user');
const Profile = require('../models/profileModel');
const Blog = require('../models/blog');
const Like = require('../models/like');
const Comment = require('../models/comment');
const FriendRequest = require('../models/friendRequestModel');
const Friend = require('../models/friend');
const Feedback = require('../models/feedback');
const Event = require('../models/eventModel');
const Fee = require('../models/fee');
const PaidFees = require('../models/paidFeesModel');
const Payment = require('../models/paymentModel');
const RoutineConfig = require('../models/routineConfig');
const RoutineEntry = require('../models/routineEntry');
const Deadline = require('../models/deadlineModel');
const TimeSlot = require('../models/timeSlot');
const Appointment = require('../models/appointment');
const AcademicCalendar = require('../models/academicModel');
const LostAndFound = require('../models/lostAndFoundModel');
const Notification = require('../models/notification');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
};

const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    header: (msg) => console.log(`\n${colors.bright}${colors.red}${'='.repeat(60)}${colors.reset}`),
};

async function resetDatabase() {
    try {
        log.header();
        log.warning('⚠️  DATABASE RESET SCRIPT ⚠️');
        log.warning('This will DELETE ALL DATA and recreate tables!');
        log.header();

        // Test connection
        log.info('Testing database connection...');
        await sequelizeVidhyatra.authenticate();
        log.success('Connected to database');

        // Drop and recreate all tables
        log.warning('Dropping all tables...');
        await sequelizeVidhyatra.sync({ force: true });
        log.success('All tables dropped and recreated successfully!');

        // List all created tables
        const models = [
            { name: 'Admin', model: Admin },
            { name: 'User', model: User },
            { name: 'Profile', model: Profile },
            { name: 'Blog', model: Blog },
            { name: 'Like', model: Like },
            { name: 'Comment', model: Comment },
            { name: 'FriendRequest', model: FriendRequest },
            { name: 'Friend', model: Friend },
            { name: 'Feedback', model: Feedback },
            { name: 'Event', model: Event },
            { name: 'Fee', model: Fee },
            { name: 'PaidFees', model: PaidFees },
            { name: 'Payment', model: Payment },
            { name: 'RoutineConfig', model: RoutineConfig },
            { name: 'RoutineEntry', model: RoutineEntry },
            { name: 'Deadline', model: Deadline },
            { name: 'TimeSlot', model: TimeSlot },
            { name: 'Appointment', model: Appointment },
            { name: 'AcademicCalendar', model: AcademicCalendar },
            { name: 'LostAndFound', model: LostAndFound },
            { name: 'Notification', model: Notification },
        ];

        log.header();
        log.info('Created Tables:');
        log.header();
        
        for (const { name, model } of models) {
            const tableName = model.getTableName();
            log.success(`${name.padEnd(20)} -> ${tableName}`);
        }

        log.header();
        log.success('Database reset completed successfully! 🎉');
        log.success('All tables are now empty and ready for use');
        log.header();

    } catch (error) {
        log.header();
        log.error('Database reset failed!');
        log.error(`Error: ${error.message}`);
        console.error(error);
        log.header();
        process.exit(1);
    } finally {
        await sequelizeVidhyatra.close();
        log.info('Database connection closed');
        process.exit(0);
    }
}

// Confirmation prompt
console.log('\n');
log.warning('⚠️  WARNING: This script will DELETE ALL DATA! ⚠️');
console.log('\nPress Ctrl+C to cancel, or wait 3 seconds to continue...\n');

setTimeout(() => {
    resetDatabase();
}, 3000);
