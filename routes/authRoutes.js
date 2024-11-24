const express = require('express');
const { registerStudent, loginUser, getUserDetails } = require('../controller/authController');
const authenticateUser = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerStudent);

router.post('/login', loginUser); // Add the login route

module.exports = router;