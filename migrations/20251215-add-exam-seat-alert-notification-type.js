'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Alter the ENUM to add 'EXAM_SEAT_ALERT' type
    await queryInterface.sequelize.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN type ENUM(
        'BLOG_POST', 
        'FRIEND_REQUEST', 
        'EVENT_REMINDER', 
        'FEE_REMINDER', 
        'DEADLINE_ALERT',
        'APPOINTMENT_CONFIRMATION',
        'ACADEMIC_UPDATE',
        'SYSTEM_ANNOUNCEMENT',
        'LOST_AND_FOUND',
        'ANNOUNCEMENT',
        'EXAM_SEAT_ALERT'
      ) NOT NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to original ENUM (remove 'EXAM_SEAT_ALERT')
    await queryInterface.sequelize.query(`
      ALTER TABLE notifications 
      MODIFY COLUMN type ENUM(
        'BLOG_POST', 
        'FRIEND_REQUEST', 
        'EVENT_REMINDER', 
        'FEE_REMINDER', 
        'DEADLINE_ALERT',
        'APPOINTMENT_CONFIRMATION',
        'ACADEMIC_UPDATE',
        'SYSTEM_ANNOUNCEMENT',
        'LOST_AND_FOUND',
        'ANNOUNCEMENT'
      ) NOT NULL;
    `);
  }
};
