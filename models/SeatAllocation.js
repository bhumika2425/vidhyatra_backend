// models/SeatAllocation.js
const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');

const SeatAllocation = sequelizeVidhyatra.define('SeatAllocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'exams',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'Foreign key to exams table'
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Student ID must be positive'
      }
    },
    comment: 'Student ID from icp_students database'
  },
  college_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'College ID is required'
      }
    },
    comment: 'Student college ID (e.g., BIT2021001)'
  },
  student_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Student name is required'
      }
    },
    comment: 'Student full name'
  },
  classroom_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'classrooms',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    comment: 'Foreign key to classrooms table'
  },
  seat_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Seat number must be positive'
      }
    },
    comment: 'Seat number within the classroom'
  },
  row_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Row number must be positive'
      }
    },
    comment: 'Row number in the classroom seating layout'
  },
  column_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Column number must be positive'
      }
    },
    comment: 'Column number in the classroom seating layout'
  },
  allocation_strategy: {
    type: DataTypes.ENUM('random_mixed', 'section_separated', 'roll_number'),
    allowNull: false,
    comment: 'Strategy used for seat allocation'
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
  tableName: 'seat_allocations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_exam_id',
      fields: ['exam_id']
    },
    {
      name: 'idx_student_id',
      fields: ['student_id']
    },
    {
      name: 'idx_classroom_id',
      fields: ['classroom_id']
    },
    {
      name: 'idx_college_id',
      fields: ['college_id']
    },
    {
      name: 'idx_exam_classroom',
      fields: ['exam_id', 'classroom_id']
    },
    {
      name: 'unique_exam_student',
      unique: true,
      fields: ['exam_id', 'student_id']
    },
    {
      name: 'unique_exam_classroom_seat',
      unique: true,
      fields: ['exam_id', 'classroom_id', 'seat_number']
    }
  ]
});

// Instance methods
SeatAllocation.prototype.getSeatLocation = function() {
  return `Row ${this.row_number}, Seat ${this.seat_number}`;
};

module.exports = SeatAllocation;
