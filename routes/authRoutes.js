const express = require('express');
const { registerStudent, loginUser, getUserDetails } = require('../controller/authController');

const router = express.Router();

router.post('/register', registerStudent);

router.post('/login', loginUser); // Add the login route

module.exports = router;