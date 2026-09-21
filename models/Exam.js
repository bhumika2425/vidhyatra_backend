// models/Exam.js
const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');

const Exam = sequelizeVidhyatra.define('Exam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Subject name is required'
      },
      len: {
        args: [2, 200],
        msg: 'Subject must be between 2 and 200 characters'
      }
    },
    comment: 'Subject name (e.g., Data Structures, Artificial Intelligence)'
  },
  module_code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Module code is required'
      }
    },
    comment: 'Module/course code (e.g., CS301, BBA201)'
  },
  exam_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: {
        msg: 'Must be a valid date'
      },
      isAfterToday(value) {
        if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
          throw new Error('Exam date must be in the future');
        }
      }
    },
    comment: 'Date of the exam'
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Start time is required'
      }
    },
    comment: 'Exam start time'
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'End time is required'
      },
      isAfterStartTime(value) {
        if (this.start_time && value <= this.start_time) {
          throw new Error('End time must be after start time');
        }
      }
    },
    comment: 'Exam end time'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [30],
        msg: 'Duration must be at least 30 minutes'
      },
      max: {
        args: [480],
        msg: 'Duration cannot exceed 8 hours (480 minutes)'
      }
    },
    comment: 'Duration in minutes'
  },
  exam_type: {
    type: DataTypes.ENUM('Final', 'Midterm', 'Sessional'),
    allowNull: false,
    defaultValue: 'Final',
    comment: 'Type of examination'
  },
  faculty: {
    type: DataTypes.ENUM('BIT', 'BBA'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Faculty is required'
      }
    },
    comment: 'Faculty/Program (BIT or BBA)'
  },
  year: {
    type: DataTypes.ENUM('1st', '2nd', '3rd'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Year is required'
      }
    },
    comment: 'Academic year'
  },
  semester: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Semester is required'
      },
      isValidSemester(value) {
        // Accept "1st", "2nd", or JSON array string like '["1st","2nd"]'
        const validSingleValues = ['1st', '2nd'];
        try {
          // Try parsing as JSON array
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            const allValid = parsed.every(s => validSingleValues.includes(s));
            if (!allValid) {
              throw new Error('Semester array must contain only "1st" or "2nd"');
            }
            return;
          }
        } catch (e) {
          // Not JSON, check if it's a valid single value
          if (!validSingleValues.includes(value)) {
            throw new Error('Semester must be "1st", "2nd", or ["1st","2nd"]');
          }
        }
      }
    },
    comment: 'Semester - can be "1st", "2nd", or JSON array ["1st","2nd"] for both'
  },
  section: {
    type: DataTypes.STRING(20),
    defaultValue: 'all',
    comment: 'Section filter - "all" or specific section like "A", "B"'
  },
  total_students: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Total students cannot be negative'
      }
    },
    comment: 'Total number of eligible students'
  },
  status: {
    type: DataTypes.ENUM('draft', 'allocated', 'published'),
    allowNull: false,
    defaultValue: 'draft',
    comment: 'Exam status - draft, allocated (seats assigned), published (visible to students)'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'exams',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_exam_date',
      fields: ['exam_date']
    },
    {
      name: 'idx_status',
      fields: ['status']
    },
    {
      name: 'idx_faculty_year',
      fields: ['faculty', 'year']
    },
    {
      name: 'idx_created_at',
      fields: ['created_at']
    }
  ]
});

// Instance methods
Exam.prototype.getSemesterArray = function() {
  try {
    return JSON.parse(this.semester);
  } catch (e) {
    return [this.semester];
  }
};

Exam.prototype.isPublished = function() {
  return this.status === 'published';
};

Exam.prototype.isDraft = function() {
  return this.status === 'draft';
};

Exam.prototype.canEdit = function() {
  return this.status !== 'published';
};

module.exports = Exam;
