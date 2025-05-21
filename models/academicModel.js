const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');
const Admin = require('./adminModel');

// Define event types and academic years as constants
const EVENT_TYPES = ['EXAM', 'HOLIDAY'];
const ACADEMIC_YEARS = ['1st year', '2nd Year', '3rd Year'];
const SEMESTERS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];
const EXAM_TYPES = ['Mid-Term', 'Final', 'Pre-Board', 'Board', 'Internal'];
const HOLIDAY_TYPES = ['Public Holiday', 'Academic Holiday', 'Festival', 'Others'];

const Academic = sequelizeVidhyatra.define('Academic', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Title is required' }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    eventType: {
        type: DataTypes.ENUM(...EVENT_TYPES),
        allowNull: false,
        validate: {
            isIn: {
                args: [EVENT_TYPES],
                msg: 'Invalid event type'
            }
        }
    },
    // Fields specific to exams
    examType: {
        type: DataTypes.ENUM(...EXAM_TYPES),
        allowNull: true,
        validate: {
            isValidForExam(value) {
                if (this.eventType === 'EXAM' && !value) {
                    throw new Error('Exam type is required for exam events');
                }
            }
        }
    },
    subject: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    // Fields specific to holidays
    holidayType: {
        type: DataTypes.ENUM(...HOLIDAY_TYPES),
        allowNull: true,
        validate: {
            isValidForHoliday(value) {
                if (this.eventType === 'HOLIDAY' && !value) {
                    throw new Error('Holiday type is required for holiday events');
                }
            }
        }
    },
    // Common fields
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: { msg: 'Invalid date format' },
            notInPast(value) {
                if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
                    throw new Error('Start date cannot be in the past');
                }
            }
        }
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isDate: { msg: 'Invalid date format' },
            isAfterStartDate(value) {
                if (new Date(value) < new Date(this.startDate)) {
                    throw new Error('End date must be after start date');
                }
            }
        }
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: true,
        validate: {
            isValidForExam(value) {
                if (this.eventType === 'EXAM' && !value) {
                    throw new Error('Start time is required for exam events');
                }
            }
        }
    },
    duration: {
        type: DataTypes.INTEGER, // Duration in minutes
        allowNull: true,
        validate: {
            isValidForExam(value) {
                if (this.eventType === 'EXAM' && !value) {
                    throw new Error('Duration is required for exam events');
                }
            },
            min: {
                args: [30],
                msg: 'Duration must be at least 30 minutes'
            }
        }
    },
    venue: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isValidForExam(value) {
                if (this.eventType === 'EXAM' && !value) {
                    throw new Error('Venue is required for exam events');
                }
            }
        }
    },
    year: {
        type: DataTypes.ENUM(...ACADEMIC_YEARS),
        allowNull: false,
        validate: {
            isIn: {
                args: [ACADEMIC_YEARS],
                msg: 'Invalid academic year'
            }
        }
    },
    semester: {
        type: DataTypes.ENUM(...SEMESTERS),
        allowNull: false,
        validate: {
            isIn: {
                args: [SEMESTERS],
                msg: 'Invalid semester'
            }
        }
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Admin,
            key: 'admin_id'
        }
    }
}, {
    tableName: 'academic_calendar',
    timestamps: true,
    indexes: [
        {
            fields: ['eventType']
        },
        {
            fields: ['startDate']
        },
        {
            fields: ['year']
        }
    ]
});

// Define relationships
Academic.belongsTo(Admin, {
    foreignKey: 'created_by',
    as: 'creator'
});

// Static methods
Academic.EVENT_TYPES = EVENT_TYPES;
Academic.ACADEMIC_YEARS = ACADEMIC_YEARS;
Academic.SEMESTERS = SEMESTERS;
Academic.EXAM_TYPES = EXAM_TYPES;
Academic.HOLIDAY_TYPES = HOLIDAY_TYPES;

module.exports = Academic;