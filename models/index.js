const User = require('./user');
const TimeSlot = require('./timeSlot');
const Appointment = require('./appointment');

// Define associations
User.hasMany(TimeSlot, { foreignKey: 'teacher_id', as: 'timeSlots' });
TimeSlot.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

Appointment.belongsTo(TimeSlot, { foreignKey: 'slot_id', as: 'timeSlot' });
Appointment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

module.exports = {
    User,
    TimeSlot,
    Appointment
};