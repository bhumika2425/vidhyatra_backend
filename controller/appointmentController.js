const { User, TimeSlot, Appointment } = require('../models');
const { sequelizeVidhyatra } = require('../config/db');
const { Op } = require('sequelize');

// Book an appointment
const bookAppointment = async (req, res) => {
  const transaction = await sequelizeVidhyatra.transaction();
  
  try {
    const { slot_id, reason } = req.body;
    const student_id = req.user.user_id;
    
    if (req.user.role !== 'Student') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Only students can book appointments' });
    }
    
    const timeSlot = await TimeSlot.findByPk(slot_id, { transaction });
    
    if (!timeSlot) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Time slot not found' });
    }
    
    if (timeSlot.is_booked) {
      await transaction.rollback();
      return res.status(400).json({ message: 'This time slot is already booked' });
    }
    
    const slotDate = new Date(`${timeSlot.date}T${timeSlot.start_time}`); //Converts date and time into a JS Date object and ensures it's in the future
    if (slotDate < new Date()) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Cannot book a time slot in the past' });
    }

    if (!reason || reason.trim().length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Please provide a reason for the appointment' });
    } //Ensures that a valid reason is provided by the student.
    
    const appointment = await Appointment.create({
      slot_id,
      student_id,
      reason,
      status: 'confirmed'
    }, { transaction }); //Creates the new Appointment in the database with status set to 'confirmed'
    
    await timeSlot.update({ is_booked: true }, { transaction });
    //Marks the time slot as booked after creating the appointment.

    await transaction.commit();
    
    const completeAppointment = await Appointment.findByPk(appointment.appointment_id, {
      include: [
        {
          model: TimeSlot,
          as: 'timeSlot',
          include: [
            {
              model: User,
              as: 'teacher',
              attributes: ['user_id', 'name', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'student',
          attributes: ['user_id', 'name', 'email']
        }
      ]
    });
    
    res.status(201).json(completeAppointment);
  } catch (error) {
    await transaction.rollback();
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all appointments for a student
const getStudentAppointments = async (req, res) => {
  try {
    const student_id = req.user.user_id;
    //Retrieves the logged-in student's ID
    
    const appointments = await Appointment.findAll({
      where: { student_id },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: TimeSlot,
          as: 'timeSlot',
          include: [
            {
              model: User,
              as: 'teacher',
              attributes: ['user_id', 'name', 'email']
            }
          ]
        }
      ]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching student appointments:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all appointments for a teacher
const getTeacherAppointments = async (req, res) => {
  try {
    const teacher_id = req.user.user_id;
    
    const appointments = await Appointment.findAll({
      include: [
        {
          model: TimeSlot,
          as: 'timeSlot',
          where: { teacher_id },
          include: [
            {
              model: User,
              as: 'teacher',
              attributes: ['user_id', 'name', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'student',
          attributes: ['user_id', 'name', 'email']
        }
      ],
      order: [[{ model: TimeSlot, as: 'timeSlot' }, 'date', 'ASC'], [{ model: TimeSlot, as: 'timeSlot' }, 'start_time', 'ASC']]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching teacher appointments:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Cancel an appointment
const cancelAppointment = async (req, res) => {
  const transaction = await sequelizeVidhyatra.transaction();
  
  try {
    const { appointment_id } = req.params;
    const user_id = req.user.user_id;
    
    const appointment = await Appointment.findByPk(appointment_id, {
      include: [{
        model: TimeSlot,
        as: 'timeSlot'
      }],
      transaction
    });
    
    if (!appointment) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    const isStudent = appointment.student_id === user_id;
    const isTeacher = appointment.timeSlot.teacher_id === user_id;
    
    if (!isStudent && !isTeacher) {
      await transaction.rollback();
      return res.status(403).json({ message: 'You can only cancel your own appointments' });
    }
    
    if (appointment.status === 'cancelled') {
      await transaction.rollback();
      return res.status(400).json({ message: 'This appointment is already cancelled' });
    }
    
    await appointment.update({ status: 'cancelled' }, { transaction });
    
    await TimeSlot.update(
      { is_booked: false },
      { where: { slot_id: appointment.slot_id }, transaction }
    );
    
    await transaction.commit();
    res.status(200).json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get a specific appointment detail
const getAppointmentDetail = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const user_id = req.user.user_id;
    
    const appointment = await Appointment.findByPk(appointment_id, {
      include: [
        {
          model: TimeSlot,
          as: 'timeSlot',
          include: [
            {
              model: User,
              as: 'teacher',
              attributes: ['user_id', 'name', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'student',
          attributes: ['user_id', 'name', 'email']
        }
      ]
    });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    const isStudent = appointment.student_id === user_id;
    const isTeacher = appointment.timeSlot.teacher_id === user_id;
    
    if (!isStudent && !isTeacher && !req.isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to view this appointment' });
    }
    
    res.status(200).json(appointment);
  } catch (error) {
    console.error('Error fetching appointment detail:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get list of teachers with their total and available time slots
const getTeachers = async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: { role: 'Teacher' },
      attributes: [
        'user_id',
        'name',
        'email',
        // 'department',
      ],
      include: [
        {
          model: TimeSlot,
          as: 'timeSlots',
          attributes: [],
          required: false,
          where: {
            date: { [Op.gte]: new Date().toISOString().split('T')[0] },
          },
        },
      ],
      group: ['User.user_id'],
      raw: true,
      subQuery: false,
      attributes: [
        'user_id',
        'name',
        'email',
        // 'department',
        [sequelizeVidhyatra.fn('COUNT', sequelizeVidhyatra.col('timeSlots.slot_id')), 'totalTimeSlots'],
        [
          sequelizeVidhyatra.fn(
            'SUM',
            sequelizeVidhyatra.literal("CASE WHEN timeSlots.is_booked = false THEN 1 ELSE 0 END")
          ),
          'availableTimeSlots',
        ],
      ],
      order: [['name', 'ASC']],
    });

    const formattedTeachers = teachers.map(teacher => ({
      user_id: teacher.user_id,
      name: teacher.name,
      email: teacher.email,
      // department: teacher.department || 'Unknown',
      totalTimeSlots: parseInt(teacher.totalTimeSlots) || 0,
      availableTimeSlots: parseInt(teacher.availableTimeSlots) || 0,
    }));

    res.status(200).json(formattedTeachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Export all functions
module.exports = {
  bookAppointment,
  getStudentAppointments,
  getTeacherAppointments,
  cancelAppointment,
  getAppointmentDetail,
  getTeachers,
};