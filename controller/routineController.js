const Routine = require('../models/routine');
const jwt = require('jsonwebtoken');

// Admin: Post a new routine
const createRoutine = async (req, res) => {
  const { day, start_time, end_time, year,semester, section, room, module_name, status } = req.body;

  try {
    console.log('Request Body:', req.body); // Debug log

    // Step 1: Verify the JWT token (authentication)
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided. Authentication required.' });
    }

    let user;
    try {
      user = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      console.log('Decoded JWT Token:', user); // Debug log
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // Step 2: Check if the user is an admin (authorization)
    if (user.role !== 'Admin') { // Updated to check role
      return res.status(403).json({ message: 'Only admins can create routines.' });
    }

    // Step 3: Validate required fields
    if (!day || !start_time || !end_time || !year || !section || !room || !module_name) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // Validate day (must be a valid ENUM value)
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({ message: `Day must be one of: ${validDays.join(', ')}` });
    }

    // Validate status (if provided)
    if (status) {
      const validStatuses = ['ongoing', 'upcoming'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
      }
    }

    // Validate time format (HH:mm:ss) and ensure end_time is after start_time
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return res.status(400).json({ message: 'Start time and end time must be in HH:mm:ss format.' });
    }

    const start = new Date(`1970-01-01T${start_time}Z`);
    const end = new Date(`1970-01-01T${end_time}Z`);
    if (end <= start) {
      return res.status(400).json({ message: 'End time must be after start time.' });
    }

    // Check if section already has 2 classes for the day
    const count = await Routine.count({
      where: {
        day,
        section,
      },
    });
    console.log(`Routine count for day ${day} and section ${section}: ${count}`); // Debug log
    if (count >= 2) {
      return res.status(400).json({ message: 'Only 2 classes allowed per section per day.' });
    }

    const newRoutine = await Routine.create({
      day,
      start_time,
      end_time,
      year,
      semester,
      section,
      room,
      module_name,
      status: status || 'upcoming',
      created_by: user.user_id,
    });
    console.log('Created Routine:', newRoutine); // Debug log

    res.status(201).json({ message: 'Routine created successfully.', routine: newRoutine });
  } catch (error) {
    console.error('Error creating routine:', error);
    res.status(500).json({ message: 'Error creating routine.', error: error.message });
  }
};

// Users: Get all routines
const getAllRoutines = async (req, res) => {
  try {
    const routines = await Routine.findAll({
      order: [['day', 'ASC']],
    });
    res.status(200).json(routines);
  } catch (error) {
    console.error('Error fetching routines:', error);
    res.status(500).json({ message: 'Error fetching routines.', error: error.message });
  }
};

// Users: Get routines for a specific day
const getRoutinesByDay = async (req, res) => {
  const { day } = req.params;

  try {
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({ message: `Day must be one of: ${validDays.join(', ')}` });
    }

    const routines = await Routine.findAll({ where: { day } });
    res.status(200).json(routines);
  } catch (error) {
    console.error('Error fetching routines:', error);
    res.status(500).json({ message: 'Error fetching routines for the day.', error: error.message });
  }
};

module.exports = {
  createRoutine,
  getAllRoutines,
  getRoutinesByDay,
};