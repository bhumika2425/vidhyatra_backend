const { TimeSlot, User } = require('../models');
const { Op } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');

// Helper function to count slots for a specific date and teacher
const countSlotsForDate = async (teacherId, date) => {
  return await TimeSlot.count({
    where: {
      teacher_id: teacherId,
      date: date,
    },
  });
};

// Create a new time slot
const createTimeSlot = async (req, res) => {
  const transaction = await sequelizeVidhyatra.transaction();

  try {
    const { date, start_time, end_time } = req.body;
    const teacher_id = req.user.user_id;

    // Validate that the user is a teacher
    if (req.user.role !== 'Teacher') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Only teachers can create time slots' });
    }

    // Check if teacher already has 10 slots for this date
    const slotCount = await countSlotsForDate(teacher_id, date);
    if (slotCount >= 10) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Maximum 10 time slots allowed per day' });
    }

    // Validate time format and that end time is after start time
    const startDateTime = new Date(`${date}T${start_time}`);
    const endDateTime = new Date(`${date}T${end_time}`);

    if (endDateTime <= startDateTime) {
      await transaction.rollback();
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Check for overlapping slots
    const overlappingSlots = await TimeSlot.findOne({
      where: {
        teacher_id,
        date,
        [Op.or]: [
          {
            [Op.and]: [
              { start_time: { [Op.lte]: start_time } },
              { end_time: { [Op.gt]: start_time } },
            ],
          },
          {
            [Op.and]: [
              { start_time: { [Op.lt]: end_time } },
              { end_time: { [Op.gte]: end_time } },
            ],
          },
          {
            [Op.and]: [
              { start_time: { [Op.gte]: start_time } },
              { end_time: { [Op.lte]: end_time } },
            ],
          },
        ],
      },
      transaction,
    });

    if (overlappingSlots) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Time slot overlaps with an existing slot' });
    }

    // Create the time slot
    const timeSlot = await TimeSlot.create(
      {
        teacher_id,
        date,
        start_time,
        end_time,
        is_booked: false,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).json(timeSlot);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating time slot:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all time slots for a teacher
const getTeacherTimeSlots = async (req, res) => {
  try {
    const teacher_id = req.user.user_id;

    // Optional date filter
    const { date } = req.query;
    const whereClause = { teacher_id };

    if (date) {
      whereClause.date = date;
    }

    const timeSlots = await TimeSlot.findAll({
      where: whereClause,
      order: [['date', 'ASC'], ['start_time', 'ASC']],
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['user_id', 'name', 'email'],
        },
      ],
    });

    res.status(200).json(timeSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get available time slots for a specific teacher
const getAvailableTimeSlots = async (req, res) => {
  try {
    const { teacher_id, date } = req.query;

    if (!teacher_id) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }

    const whereClause = {
      teacher_id,
      is_booked: false,
    };

    if (date) {
      whereClause.date = date;
    } else {
      whereClause.date = { [Op.gte]: new Date().toISOString().split('T')[0] };
    }

    const timeSlots = await TimeSlot.findAll({
      where: whereClause,
      order: [['date', 'ASC'], ['start_time', 'ASC']],
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['user_id', 'name', 'email'],
        },
      ],
    });

    res.status(200).json(timeSlots);
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update a time slot
const updateTimeSlot = async (req, res) => {
  const transaction = await sequelizeVidhyatra.transaction();

  try {
    const { slot_id } = req.params;
    const { date, start_time, end_time } = req.body;
    const teacher_id = req.user.user_id;

    // Find the time slot
    const timeSlot = await TimeSlot.findByPk(slot_id, { transaction });

    if (!timeSlot) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Time slot not found' });
    }

    // Check if the user is the owner of the time slot
    if (timeSlot.teacher_id !== teacher_id) {
      await transaction.rollback();
      return res.status(403).json({ message: 'You can only update your own time slots' });
    }

    // Check if the slot is already booked
    if (timeSlot.is_booked) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Cannot update a booked time slot' });
    }

    // Validate that the end time is after the start time
    if (start_time && end_time) {
      const startDateTime = new Date(`${date || timeSlot.date}T${start_time}`);
      const endDateTime = new Date(`${date || timeSlot.date}T${end_time}`);

      if (endDateTime <= startDateTime) {
        await transaction.rollback();
        return res.status(400).json({ message: 'End time must be after start time' });
      }
    }

    // Check for overlapping slots (excluding the current slot)
    if (date || start_time || end_time) {
      const overlappingSlots = await TimeSlot.findOne({
        where: {
          teacher_id,
          date: date || timeSlot.date,
          slot_id: { [Op.ne]: slot_id },
          [Op.or]: [
            {
              [Op.and]: [
                { start_time: { [Op.lte]: start_time || timeSlot.start_time } },
                { end_time: { [Op.gt]: start_time || timeSlot.start_time } },
              ],
            },
            {
              [Op.and]: [
                { start_time: { [Op.lt]: end_time || timeSlot.end_time } },
                { end_time: { [Op.gte]: end_time || timeSlot.end_time } },
              ],
            },
            {
              [Op.and]: [
                { start_time: { [Op.gte]: start_time || timeSlot.start_time } },
                { end_time: { [Op.lte]: end_time || timeSlot.end_time } },
              ],
            },
          ],
        },
        transaction,
      });

      if (overlappingSlots) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Time slot overlaps with an existing slot' });
      }
    }

    // Update the time slot
    await timeSlot.update(
      {
        date: date || timeSlot.date,
        start_time: start_time || timeSlot.start_time,
        end_time: end_time || timeSlot.end_time,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json(timeSlot);
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating time slot:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete a time slot
const deleteTimeSlot = async (req, res) => {
  const transaction = await sequelizeVidhyatra.transaction();

  try {
    const { slot_id } = req.params;
    const teacher_id = req.user.user_id;

    // Find the time slot
    const timeSlot = await TimeSlot.findByPk(slot_id, { transaction });

    if (!timeSlot) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Time slot not found' });
    }

    // Check if the user is the owner of the time slot
    if (timeSlot.teacher_id !== teacher_id) {
      await transaction.rollback();
      return res.status(403).json({ message: 'You can only delete your own time slots' });
    }

    // Check if the slot is already booked
    if (timeSlot.is_booked) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Cannot delete a booked time slot. Cancel the appointment first.' });
    }

    // Delete the time slot
    await timeSlot.destroy({ transaction });

    await transaction.commit();
    res.status(200).json({ message: 'Time slot deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting time slot:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Export all functions
module.exports = {
  createTimeSlot,
  getTeacherTimeSlots,
  getAvailableTimeSlots,
  updateTimeSlot,
  deleteTimeSlot,
};