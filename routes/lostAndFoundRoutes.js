const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { lostAndFoundImageUpload } = require('../config/multerConfig');
const {
  createLostAndFound,
  getLostAndFoundPosts,
  getLostAndFoundById,
  updateLostAndFound,
  deleteLostAndFound
} = require('../controller/lostAndFoundController');

// Get all lost and found posts (no auth required for viewing)
router.get('/fetchAll', getLostAndFoundPosts);

// Get specific post by ID (no auth required for viewing)
router.get('/fetchById/:id', getLostAndFoundById);

// Protected routes - require authentication
router.post('/create', authenticateUser, lostAndFoundImageUpload, createLostAndFound);
router.put('/updateById/:id', authenticateUser, lostAndFoundImageUpload, updateLostAndFound);
router.delete('/deleteById/:id', authenticateUser, deleteLostAndFound);

module.exports = router;