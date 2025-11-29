/**
 * Database Initialization Script
 * This script creates all database tables based on the Sequelize models
 */

const { sequelizeVidhyatra } = require('../config/db');

// Import all models in the correct order (respecting foreign key dependencies)
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

// Color codes for console output
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
    header: (msg) => console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`),
};

async function initializeDatabase() {
    try {
        log.header();
        log.info('Starting Database Initialization...');
        log.header();

        // Test database connection
        log.info('Testing database connection...');
        await sequelizeVidhyatra.authenticate();
        log.success('Database connection established successfully');

        // Get list of all models
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

        log.info(`Found ${models.length} models to synchronize`);
        console.log('');

        // Sync all models (create tables)
        log.info('Creating tables...');
        
        // Use force: false to avoid dropping existing tables
        // Use alter: true to update existing tables if schema changed
        await sequelizeVidhyatra.sync({ 
            force: false,  // Don't drop tables
            alter: false   // Set to true if you want to update existing tables
        });

        log.success('All tables created/verified successfully!');
        console.log('');

        // Display table information
        log.header();
        log.info('Database Tables Summary:');
        log.header();
        
        for (const { name, model } of models) {
            const tableName = model.getTableName();
            try {
                const [results] = await sequelizeVidhyatra.query(
                    `SELECT COUNT(*) as count FROM ${tableName}`
                );
                const count = results[0].count;
                log.success(`${name.padEnd(20)} -> ${tableName.padEnd(25)} (${count} records)`);
            } catch (error) {
                log.error(`${name.padEnd(20)} -> ${tableName.padEnd(25)} (Error: ${error.message})`);
            }
        }

        log.header();
        log.success('Database initialization completed successfully! 🎉');
        log.header();

    } catch (error) {
        log.header();
        log.error('Database initialization failed!');
        log.error(`Error: ${error.message}`);
        console.error(error);
        log.header();
        process.exit(1);
    } finally {
        // Close database connection
        await sequelizeVidhyatra.close();
        log.info('Database connection closed');
        process.exit(0);
    }
}

// Run the initialization
initializeDatabase();
