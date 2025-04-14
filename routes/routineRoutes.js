// const express = require('express');
// const { createRoutine, getAllRoutines, getRoutinesByDay } = require('../controller/routineController');

// const router = express.Router();

// // Admin: Create a new routine (authentication and admin check handled in controller)
// router.post('/create', createRoutine);

// // Users: Get all routines
// router.get('/', getAllRoutines);

// // Users: Get routines for a specific day
// router.get('/day/:day', getRoutinesByDay);

// module.exports = router;


const express = require('express');
const router = express.Router();
const routineController = require('../controller/routineController');
const { authenticateUser } = require('../middleware/auth');

router.get('/', routineController.getRoutines);
router.get('/my-routine', authenticateUser, routineController.getRoutinesForAuthenticatedUser);
router.get('/:configId', routineController.getRoutinesByConfigId);
router.post('/', routineController.createRoutine);

module.exports = router;