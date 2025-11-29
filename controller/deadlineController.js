const Deadline = require('../models/deadlineModel');

const notificationService = require('../services/notificationService');
const Profile = require('../models/profileModel');
const { Op } = require('sequelize');

const getAllDeadlines = async (req, res) => {
  try {
    // Step 1: Get the logged-in user's ID from the request (assuming req.user is set by auth middleware)
    const userId = req.user?.user_id; // Adjust this based on your auth setup, e.g., req.user.user_id
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Step 2: Fetch the user's profile to get their year and semester
    const userProfile = await Profile.findOne({ where: { user_id: userId } });
    if (!userProfile) {
      return res.status(404).json({ error: 'Profile not found for this user' });
    }

    const { year, semester } = userProfile;

    // Step 3: Fetch deadlines that match the user's year and semester
    const deadlines = await Deadline.findAll({
      where: {
        year: year || null,      // Handle null case if year is optional
        semester: semester || null // Handle null case if semester is optional
      }
    });

    // Step 4: Return the filtered deadlines
    res.json(deadlines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getDeadlineById = async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id);
    if (!deadline) return res.status(404).json({ message: 'Deadline not found' });
    res.json(deadline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const createDeadline = async (req, res) => {
    try {
        const { title, course, year, semester, deadline: deadlineDate } = req.body;
        
        // Validation...
        if (!title || !course || !deadlineDate || !year || !semester) {
            return res.status(400).json({ 
                message: 'Missing required fields (title, course, deadline, year, semester).' 
            });
        }

        const deadline_date = new Date(deadlineDate);
        if (deadline_date < new Date()) {
            return res.status(400).json({ 
                message: 'Deadline date cannot be in the past.' 
            });
        }

        const isAdmin = req.isAdmin || req.user?.isAdmin || req.admin;
        if (!isAdmin) {
            return res.status(403).json({ 
                message: 'Only admins can post deadlines.' 
            });
        }

        const created_by = req.admin?.admin_id || req.user?.user_id;

        // Create deadline
        const deadline = await Deadline.create({
            title,
            course,
            year,
            semester,
            deadline: deadline_date,
            created_by: created_by,
        });

        console.log('✅ Deadline created:', deadline.id);

        // 🎯 NEW: Send notifications to affected students
        try {
            // Find all students matching the year and semester
            const profiles = await Profile.findAll({
                where: {
                    year: year,
                    semester: semester
                },
                attributes: ['user_id', 'full_name']
            });

            console.log(`📢 Found ${profiles.length} students for ${year} ${semester}`);

            if (profiles.length > 0) {
                const userIds = profiles.map(profile => profile.user_id);
                
                // Prepare notification data
                const notificationData = {
                    title: 'New Deadline Added',
                    message: `${title} for ${course} is due on ${deadline_date.toLocaleDateString()}`,
                    type: 'DEADLINE_ALERT',
                    priority: 'HIGH',
                    data: {
                        deadline_id: deadline.id,
                        course: course,
                        deadline_date: deadline_date.toISOString(),
                        year: year,
                        semester: semester
                    }
                };

                // Send notifications to all affected students
                await notificationService.sendToMultipleUsers(userIds, notificationData);
                
                console.log(`✅ Notifications sent to ${userIds.length} students`);
            } else {
                console.log('⚠️ No students found for this year/semester');
            }
        } catch (notificationError) {
            // Log error but don't fail the deadline creation
            console.error('❌ Error sending notifications:', notificationError);
        }

        res.status(201).json({
            message: 'Deadline created successfully.',
            deadline,
        });
    } catch (error) {
        console.error('Error creating deadline:', error);
        res.status(500).json({ 
            message: 'Error creating deadline.', 
            error: error.message 
        });
    }
};

const updateDeadline = async (req, res) => {
  const { title, course,year,semester, deadline, isCompleted } = req.body;
  try {
    const existingDeadline = await Deadline.findById(req.params.id);
    if (!existingDeadline) return res.status(404).json({ message: 'Deadline not found' });
    await existingDeadline.update({ title, course,year,semester, deadline, isCompleted });
    res.json({ message: 'Deadline updated', deadline: existingDeadline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markDeadlineCompleted = async (req, res) => {
  const { isCompleted } = req.body;
  if (isCompleted === undefined) {
    return res.status(400).json({ message: 'isCompleted field is required' });
  }
  try {
    const deadline = await Deadline.findById(req.params.id);
    if (!deadline) return res.status(404).json({ message: 'Deadline not found' });
    await deadline.update({ isCompleted });
    res.json({ message: 'Completion status updated', deadline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteDeadline = async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id);
    if (!deadline) return res.status(404).json({ message: 'Deadline not found' });
    await deadline.destroy();
    res.json({ message: 'Deadline deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllDeadlinesAdmin = async (req, res) => {
  try {
    // Debug logging
    console.log('=== GET ALL DEADLINES ADMIN ===');
    console.log('req.isAdmin:', req.isAdmin);
    console.log('req.user:', req.user ? { user_id: req.user.user_id, isAdmin: req.user.isAdmin } : 'undefined');
    console.log('req.admin:', req.admin);
    
    // Only admin should access this route (additional check)
    if (!req.isAdmin) {
      console.log('❌ Access denied - req.isAdmin is false');
      return res.status(403).json({ message: 'Access denied. Only admins can view all deadlines.' });
    }

    console.log('✅ Admin check passed');
    
    // Fetch all deadlines without any filters
    const deadlines = await Deadline.findAll({
      order: [
        ['deadline', 'ASC'], // Order by deadline date ascending
        ['createdAt', 'DESC'] // Then by creation date descending
      ]
    });

    console.log(`📋 Fetched ${deadlines.length} deadlines`);
    res.status(200).json(deadlines);
  } catch (error) {
    console.error('❌ Error in getAllDeadlinesAdmin:', error);
    res.status(500).json({ message: 'Error fetching deadlines.', error: error.message });
  }
};

// Export controller functions (assuming authentication middleware will be added later)
module.exports = {
  getAllDeadlines,
  getAllDeadlinesAdmin,
  getDeadlineById,
  createDeadline,
  updateDeadline,
  markDeadlineCompleted,
  deleteDeadline,
};