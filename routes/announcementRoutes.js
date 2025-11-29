// routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAllAnnouncements,
  getActiveAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  togglePauseAnnouncement,
  getAnnouncementStats,
} = require('../controller/announcementController');
const { authenticateAdmin, authenticateUser, authenticateUserOrAdmin } = require('../middleware/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');
const path = require('path');

// Configure Cloudinary storage for announcements
const announcementImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'announcement-images',
    allowed_formats: ['jpeg', 'jpg', 'png'],
    public_id: (req, file) => `${Date.now()}-${path.parse(file.originalname).name}`,
  },
});

// Create multer upload instance
const uploadAnnouncementImage = multer({
  storage: announcementImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single('image');

// Admin Routes - Full CRUD operations
router.post(
  '/',
  authenticateAdmin,
  uploadAnnouncementImage,
  createAnnouncement
); // Create announcement with optional image

router.get(
  '/',
  authenticateAdmin,
  getAllAnnouncements
); // Get all announcements (including paused)

router.get(
  '/stats',
  authenticateAdmin,
  getAnnouncementStats
); // Get announcement statistics

// User Routes - Read-only access to active announcements
router.get(
  '/active/list',
  authenticateUser,
  getActiveAnnouncements
); // Get only active announcements for students

// IMPORTANT: Specific routes must come BEFORE generic /:id routes
router.patch(
  '/:id/toggle-pause',
  authenticateAdmin,
  togglePauseAnnouncement
); // Toggle pause status

router.get(
  '/:id',
  authenticateUserOrAdmin,
  getAnnouncementById
); // Get single announcement

router.put(
  '/:id',
  authenticateAdmin,
  uploadAnnouncementImage,
  updateAnnouncement
); // Update announcement

router.delete(
  '/:id',
  authenticateAdmin,
  deleteAnnouncement
); // Delete announcement

module.exports = router;
