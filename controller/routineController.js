const RoutineConfig = require('../models/routineConfig');
const RoutineEntry = require('../models/routineEntry');
const Profile = require('../models/profileModel');

exports.getRoutines = async (req, res) => {
  try {
    const configs = await RoutineConfig.findAll({
      attributes: ['config_id', 'faculty', 'year', 'semester', 'section'],
    });
    res.status(200).json(configs);
  } catch (error) {
    console.error('Error fetching routines:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createRoutine = async (req, res) => {
  const { faculty, year, semester, section, routinesByDay } = req.body;

  try {
    // Validate input
    if (!faculty || !year || !semester || !section || !routinesByDay) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if all days have entries
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const day of days) {
      if (!routinesByDay[day] || routinesByDay[day].length === 0) {
        return res.status(400).json({ message: `No entries for ${day}` });
      }
    }

    // Create RoutineConfig
    const config = await RoutineConfig.create({
      faculty,
      year,
      semester,
      section,
    });

    // Create RoutineEntries
    const entries = [];
    for (const [day, routines] of Object.entries(routinesByDay)) {
      for (const routine of routines) {
        if (!routine.subject || !routine.teacher || !routine.room || !routine.startTime || !routine.endTime) {
          throw new Error('Invalid routine entry data');
        }
        entries.push({
          config_id: config.config_id,
          day,
          subject: routine.subject,
          teacher: routine.teacher,
          room: routine.room,
          start_time: routine.startTime,
          end_time: routine.endTime,
        });
      }
    }

    await RoutineEntry.bulkCreate(entries);

    res.status(201).json({ message: 'Routine created successfully' });
  } catch (error) {
    console.error('Error creating routine:', error);
    res.status(400).json({ message: 'Failed to create routine', error: error.message });
  }
};

exports.getRoutinesByConfigId = async (req, res) => {
  const { configId } = req.params;

  try {
    const config = await RoutineConfig.findOne({
      where: { config_id: configId },
      attributes: ['config_id', 'faculty', 'year', 'semester', 'section'],
    });

    if (!config) {
      return res.status(404).json({ message: 'Routine configuration not found' });
    }

    const entries = await RoutineEntry.findAll({
      where: { config_id: configId },
      attributes: ['entry_id', 'day', 'subject', 'teacher', 'room', 'start_time', 'end_time'],
    });

    // Organize entries by day for frontend compatibility
    const routinesByDay = {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    };

    entries.forEach((entry) => {
      routinesByDay[entry.day].push({
        subject: entry.subject,
        teacher: entry.teacher,
        room: entry.room,
        startTime: entry.start_time,
        endTime: entry.end_time,
      });
    });

    res.status(200).json({
      config: config,
      routinesByDay: routinesByDay,
    });
  } catch (error) {
    console.error('Error fetching routines by config_id:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRoutinesForAuthenticatedUser = async (req, res) => {
  try {
    console.log('Entering getRoutinesForAuthenticatedUser');
    // Get user from middleware
    const user = req.user;
    if (!user) {
      console.log('No user found in req.user');
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }
    console.log('User:', user.user_id);

    // Fetch profile by user_id
    const profile = await Profile.findOne({
      where: { user_id: user.user_id },
      attributes: ['department', 'year', 'semester', 'section'],
    });

    console.log('Profile data:', profile ? profile.dataValues : null);

    // Check if profile exists
    if (!profile) {
      console.log('No profile found for user:', user.user_id);
      return res.status(400).json({ message: 'Please complete your profile to access routine features' });
    }

    // Check if profile has required fields
    if (!profile.department || !profile.year || !profile.semester || !profile.section) {
      console.log('Incomplete profile:', profile.dataValues);
      return res.status(400).json({ message: 'Profile incomplete: Please add department, year, semester, and section' });
    }

    // Find matching RoutineConfig
    const config = await RoutineConfig.findOne({
      where: {
        faculty: profile.department,
        year: profile.year,
        semester: profile.semester,
        section: profile.section,
      },
      attributes: ['config_id', 'faculty', 'year', 'semester', 'section'],
    });

    console.log('Queried config with:', {
      faculty: profile.department,
      year: profile.year,
      semester: profile.semester,
      section: profile.section,
    });

    if (!config) {
      console.log('No RoutineConfig found for profile');
      return res.status(404).json({ message: 'No routine found for your profile' });
    }

    // Fetch RoutineEntries
    const entries = await RoutineEntry.findAll({
      where: { config_id: config.config_id },
      attributes: ['entry_id', 'day', 'subject', 'teacher', 'room', 'start_time', 'end_time'],
    });

    // Organize entries by day
    const routinesByDay = {
      Sunday: [],
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    };

    entries.forEach((entry) => {
      routinesByDay[entry.day].push({
        subject: entry.subject,
        teacher: entry.teacher,
        room: entry.room,
        startTime: entry.start_time,
        endTime: entry.end_time,
      });
    });

    res.status(200).json({
      config: config,
      routinesByDay: routinesByDay,
    });
  } catch (error) {
    console.error('Error fetching routines for user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};