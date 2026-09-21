// routes/classroomRoutes.js
const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroomController');
const { authenticateUser } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateUser);

// Get all classrooms
router.get('/', classroomController.getAllClassrooms);

// Get available classrooms for exam
router.get('/available', classroomController.getAvailableClassrooms);

// Get classroom by ID
router.get('/:id', classroomController.getClassroomById);

// Create new classroom
router.post('/', classroomController.createClassroom);

// Update classroom
router.put('/:id', classroomController.updateClassroom);

// Delete classroom
router.delete('/:id', classroomController.deleteClassroom);

module.exports = router;
