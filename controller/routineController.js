const RoutineConfig = require('../models/routineConfig');
const RoutineEntry = require('../models/routineEntry');
const Profile = require('../models/profileModel');
const User = require('../models/user');
const notificationService = require('../services/notificationService');

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

    console.log('✅ Routine created for:', { faculty, year, semester, section });

    // 🎯 Send notifications to affected students
    try {
      // Find all students matching the faculty, year, semester, and section
      const profiles = await Profile.findAll({
        where: {
          department: faculty,
          year: year,
          semester: semester,
          section: section
        },
        attributes: ['user_id', 'full_name']
      });

      console.log(`📢 Found ${profiles.length} students for ${faculty} ${year} ${semester} ${section}`);

      if (profiles.length > 0) {
        const userIds = profiles.map(profile => profile.user_id);
        
        // Prepare notification data
        const notificationData = {
          title: '📅 New Class Schedule Available',
          message: `Your class routine for ${semester} has been published. Check it out now!`,
          type: 'ACADEMIC_UPDATE',
          priority: 'HIGH',
          data: {
            config_id: config.config_id,
            faculty: faculty,
            year: year,
            semester: semester,
            section: section,
            message: 'New routine has been created for your class'
          }
        };

        // Send notifications to all affected students
        await notificationService.sendToMultipleUsers(userIds, notificationData);
        
        console.log(`✅ Notifications sent to ${userIds.length} students`);
      } else {
        console.log('⚠️ No students found for this routine configuration');
      }
    } catch (notificationError) {
      // Log error but don't fail the routine creation
      console.error('❌ Error sending notifications:', notificationError);
    }

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
    console.error('Error fetching routines for user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateRoutine = async (req, res) => {
  const { configId } = req.params;
  const { faculty, year, semester, section, routinesByDay } = req.body;

  try {
    // Validate input
    if (!faculty || !year || !semester || !section || !routinesByDay) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the existing config
    const config = await RoutineConfig.findOne({
      where: { config_id: configId },
    });

    if (!config) {
      return res.status(404).json({ message: 'Routine configuration not found' });
    }

    // Update the config
    await config.update({
      faculty,
      year,
      semester,
      section,
    });

    // Delete existing entries for this config
    await RoutineEntry.destroy({
      where: { config_id: configId },
    });

    // Create new entries
    const entries = [];
    for (const [day, routines] of Object.entries(routinesByDay)) {
      for (const routine of routines) {
        if (!routine.subject || !routine.teacher || !routine.room || !routine.startTime || !routine.endTime) {
          throw new Error('Invalid routine entry data');
        }
        entries.push({
          config_id: configId,
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

    console.log('✅ Routine updated for:', { faculty, year, semester, section });

    // 🎯 Send notifications to affected students
    try {
      // Find all students matching the faculty, year, semester, and section
      const profiles = await Profile.findAll({
        where: {
          department: faculty,
          year: year,
          semester: semester,
          section: section
        },
        attributes: ['user_id', 'full_name']
      });

      console.log(`📢 Found ${profiles.length} students for ${faculty} ${year} ${semester} ${section}`);

      if (profiles.length > 0) {
        const userIds = profiles.map(profile => profile.user_id);
        
        // Prepare notification data
        const notificationData = {
          title: '🔄 Class Schedule Updated',
          message: `Your class routine for ${semester} has been updated. Check the new schedule now!`,
          type: 'ACADEMIC_UPDATE',
          priority: 'HIGH',
          data: {
            config_id: configId,
            faculty: faculty,
            year: year,
            semester: semester,
            section: section,
            message: 'Class routine has been updated'
          }
        };

        // Send notifications to all affected students
        await notificationService.sendToMultipleUsers(userIds, notificationData);
        
        console.log(`✅ Update notifications sent to ${userIds.length} students`);
      } else {
        console.log('⚠️ No students found for this routine configuration');
      }
    } catch (notificationError) {
      // Log error but don't fail the routine update
      console.error('❌ Error sending notifications:', notificationError);
    }

    res.status(200).json({ message: 'Routine updated successfully' });
  } catch (error) {
    console.error('Error updating routine:', error);
    res.status(400).json({ message: 'Failed to update routine', error: error.message });
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

    // Fetch profile by user_id (profile is automatically created on enrollment)
    const profile = await Profile.findOne({
      where: { user_id: user.user_id },
      attributes: ['department', 'year', 'semester', 'section'],
    });

    console.log('Profile data:', profile ? profile.dataValues : null);

    // If profile doesn't have required fields, return friendly message
    if (!profile || !profile.department || !profile.year || !profile.semester || !profile.section) {
      console.log('Profile incomplete or missing for user:', user.user_id);
      return res.status(200).json({ 
        message: 'Your routine is not available yet. Please be patient, we will notify you once your class schedule is ready!',
        routinesByDay: {
          Sunday: [],
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: []
        }
      });
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
      return res.status(200).json({ 
        message: 'Your routine is not created yet. Please be patient, we will let you know very soon!',
        routinesByDay: {
          Sunday: [],
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
          Saturday: []
        }
      });
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
      Saturday: []
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