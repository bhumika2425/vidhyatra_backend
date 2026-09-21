const User = require('./user');
const TimeSlot = require('./timeSlot');
const Appointment = require('./appointment');
const Classroom = require('./Classroom');
const Exam = require('./Exam');
const SeatAllocation = require('./SeatAllocation');

// Define associations
User.hasMany(TimeSlot, { foreignKey: 'teacher_id', as: 'timeSlots' });
TimeSlot.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

// Appointment associations
TimeSlot.hasOne(Appointment, { foreignKey: 'slot_id', as: 'appointment' });
Appointment.belongsTo(TimeSlot, { foreignKey: 'slot_id', as: 'timeSlot' });
Appointment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// Exam and SeatAllocation associations
Exam.hasMany(SeatAllocation, { 
  foreignKey: 'exam_id', 
  as: 'allocations',
  onDelete: 'CASCADE'
});
SeatAllocation.belongsTo(Exam, { 
  foreignKey: 'exam_id', 
  as: 'exam' 
});

// Classroom and SeatAllocation associations
Classroom.hasMany(SeatAllocation, { 
  foreignKey: 'classroom_id', 
  as: 'seatAllocations',
  onDelete: 'RESTRICT'
});
SeatAllocation.belongsTo(Classroom, { 
  foreignKey: 'classroom_id', 
  as: 'classroom' 
});

module.exports = {
    User,
    TimeSlot,
    Appointment,
    Classroom,
    Exam,
    SeatAllocation
};