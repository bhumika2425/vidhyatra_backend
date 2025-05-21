'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the old table if it exists
    await queryInterface.dropTable('academic');

    // Create the new academic_calendar table
    await queryInterface.createTable('academic_calendar', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      eventType: {
        type: Sequelize.ENUM('EXAM', 'HOLIDAY'),
        allowNull: false
      },
      examType: {
        type: Sequelize.ENUM('Mid-Term', 'Final', 'Pre-Board', 'Board', 'Internal'),
        allowNull: true
      },
      subject: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      holidayType: {
        type: Sequelize.ENUM('Public Holiday', 'Academic Holiday', 'Festival', 'Others'),
        allowNull: true
      },
      startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: true
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      venue: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      year: {
        type: Sequelize.ENUM('1st year', '2nd Year', '3rd Year'),
        allowNull: false
      },
      semester: {
        type: Sequelize.ENUM('First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'),
        allowNull: false
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'admins',
          key: 'admin_id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('academic_calendar', ['eventType']);
    await queryInterface.addIndex('academic_calendar', ['startDate']);
    await queryInterface.addIndex('academic_calendar', ['year']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the new table
    await queryInterface.dropTable('academic_calendar');

    // Recreate the old table structure if needed
    await queryInterface.createTable('academic', {
      exam_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      venue: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      exam_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      exam_start_time: {
        type: Sequelize.STRING(40),
        allowNull: false
      },
      exam_duration: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      year: {
        type: Sequelize.ENUM('1st year', '2nd Year', '3rd Year'),
        allowNull: false
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'admins',
          key: 'admin_id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  }
};
