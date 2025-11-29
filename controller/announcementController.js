// controller/announcementController.js
const Announcement = require("../models/announcement");
const User = require("../models/user");
const notificationService = require('../services/notificationService');
const { Op } = require('sequelize');

/**
 * Create a new announcement
 * @route POST /api/announcements
 * @access Admin
 */
const createAnnouncement = async (req, res) => {
  try {
    const { title, description, button_text, is_paused } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ 
        success: false,
        message: 'Title and description are required' 
      });
    }

    // Get image URL from uploaded file (if any)
    let image_url = null;
    if (req.file) {
      image_url = req.file.path; // Cloudinary URL
    }

    // Create announcement
    const newAnnouncement = await Announcement.create({
      title,
      description,
      image_url,
      button_text: button_text || 'Got it',
      is_paused: is_paused || false,
    });

    console.log('✅ Announcement created:', newAnnouncement.announcement_id);

    // 🎯 Send notifications to all students if announcement is active
    if (!newAnnouncement.is_paused) {
      try {
        // Find all students
        const students = await User.findAll({
          where: { role: 'Student' },
          attributes: ['user_id', 'name']
        });

        console.log(`📢 Found ${students.length} students for announcement notification`);

        if (students.length > 0) {
          const userIds = students.map(student => student.user_id);
          
          // Prepare notification data
          const notificationData = {
            title: '📣 New Announcement',
            message: title,
            type: 'ANNOUNCEMENT',
            priority: 'HIGH',
            data: {
              announcement_id: newAnnouncement.announcement_id,
              title: title,
              description: description.substring(0, 100) + (description.length > 100 ? '...' : ''),
              image_url: image_url
            }
          };

          // Send notifications to all students
          await notificationService.sendToMultipleUsers(userIds, notificationData);
          
          console.log(`✅ Notifications sent to ${userIds.length} students`);
        } else {
          console.log('⚠️ No students found to notify');
        }
      } catch (notificationError) {
        // Log error but don't fail the announcement creation
        console.error('❌ Error sending notifications:', notificationError);
      }
    } else {
      console.log('⏸️ Announcement is paused, skipping notifications');
    }

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: newAnnouncement,
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
      error: error.message,
    });
  }
};

/**
 * Get all announcements
 * @route GET /api/announcements
 * @access Admin (should see all including paused)
 */
const getAllAnnouncements = async (req, res) => {
  try {
    // Admin should see ALL announcements (including paused ones)
    const announcements = await Announcement.findAll({
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements',
      error: error.message,
    });
  }
};

/**
 * Get active announcements (for students)
 * @route GET /api/announcements/active
 * @access User
 */
const getActiveAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      where: { is_paused: false },
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    console.error('Error fetching active announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active announcements',
      error: error.message,
    });
  }
};

/**
 * Get a single announcement by ID
 * @route GET /api/announcements/:id
 * @access Public
 */
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    res.status(200).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcement',
      error: error.message,
    });
  }
};

/**
 * Update an announcement
 * @route PUT /api/announcements/:id
 * @access Admin
 */
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, button_text, is_paused } = req.body;

    // Find announcement
    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    // Update fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (button_text !== undefined) updateData.button_text = button_text;
    if (is_paused !== undefined) updateData.is_paused = is_paused;

    // Update image if new file is uploaded
    if (req.file) {
      updateData.image_url = req.file.path;
    }

    // Track if announcement was previously paused
    const wasPaused = announcement.is_paused;

    await announcement.update(updateData);

    console.log('✅ Announcement updated:', announcement.announcement_id);

    // 🎯 Send notifications if announcement is now active and content changed
    const isNowActive = !announcement.is_paused;
    const contentChanged = title !== undefined || description !== undefined;
    
    if (isNowActive && contentChanged) {
      try {
        // Find all students
        const students = await User.findAll({
          where: { role: 'Student' },
          attributes: ['user_id', 'name']
        });

        console.log(`📢 Found ${students.length} students for announcement update notification`);

        if (students.length > 0) {
          const userIds = students.map(student => student.user_id);
          
          // Prepare notification data
          const notificationData = {
            title: wasPaused ? '📣 New Announcement' : '🔔 Announcement Updated',
            message: announcement.title,
            type: 'ANNOUNCEMENT',
            priority: 'HIGH',
            data: {
              announcement_id: announcement.announcement_id,
              title: announcement.title,
              description: announcement.description.substring(0, 100) + (announcement.description.length > 100 ? '...' : ''),
              image_url: announcement.image_url
            }
          };

          // Send notifications to all students
          await notificationService.sendToMultipleUsers(userIds, notificationData);
          
          console.log(`✅ Update notifications sent to ${userIds.length} students`);
        }
      } catch (notificationError) {
        // Log error but don't fail the update
        console.error('❌ Error sending update notifications:', notificationError);
      }
    } else {
      console.log('⏭️ Skipping notifications (paused or no content change)');
    }

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement,
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement',
      error: error.message,
    });
  }
};

/**
 * Delete an announcement
 * @route DELETE /api/announcements/:id
 * @access Admin
 */
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    await announcement.destroy();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete announcement',
      error: error.message,
    });
  }
};

/**
 * Toggle pause status of an announcement
 * @route PATCH /api/announcements/:id/toggle-pause
 * @access Admin
 */
const togglePauseAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByPk(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
    }

    // Toggle the is_paused status
    const wasPaused = announcement.is_paused;
    announcement.is_paused = !announcement.is_paused;
    await announcement.save();

    console.log(`✅ Announcement ${announcement.is_paused ? 'paused' : 'resumed'}:`, announcement.announcement_id);

    // 🎯 Send notifications if announcement was resumed (paused -> active)
    if (wasPaused && !announcement.is_paused) {
      try {
        // Find all students
        const students = await User.findAll({
          where: { role: 'Student' },
          attributes: ['user_id', 'name']
        });

        console.log(`📢 Found ${students.length} students for announcement resume notification`);

        if (students.length > 0) {
          const userIds = students.map(student => student.user_id);
          
          // Prepare notification data
          const notificationData = {
            title: '📣 New Announcement',
            message: announcement.title,
            type: 'ANNOUNCEMENT',
            priority: 'HIGH',
            data: {
              announcement_id: announcement.announcement_id,
              title: announcement.title,
              description: announcement.description.substring(0, 100) + (announcement.description.length > 100 ? '...' : ''),
              image_url: announcement.image_url
            }
          };

          // Send notifications to all students
          await notificationService.sendToMultipleUsers(userIds, notificationData);
          
          console.log(`✅ Resume notifications sent to ${userIds.length} students`);
        }
      } catch (notificationError) {
        // Log error but don't fail the toggle
        console.error('❌ Error sending resume notifications:', notificationError);
      }
    } else if (!wasPaused && announcement.is_paused) {
      console.log('⏸️ Announcement paused, no notifications sent');
    }

    res.status(200).json({
      success: true,
      message: `Announcement ${announcement.is_paused ? 'paused' : 'resumed'} successfully`,
      data: announcement,
    });
  } catch (error) {
    console.error('Error toggling announcement pause:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle announcement pause',
      error: error.message,
    });
  }
};

/**
 * Get statistics about announcements
 * @route GET /api/announcements/stats
 * @access Admin
 */
const getAnnouncementStats = async (req, res) => {
  try {
    const totalCount = await Announcement.count();
    const activeCount = await Announcement.count({ where: { is_paused: false } });
    const pausedCount = await Announcement.count({ where: { is_paused: true } });

    res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        active: activeCount,
        paused: pausedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching announcement stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcement statistics',
      error: error.message,
    });
  }
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  getActiveAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  togglePauseAnnouncement,
  getAnnouncementStats,
};
