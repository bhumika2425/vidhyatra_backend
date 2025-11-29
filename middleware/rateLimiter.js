const rateLimit = require('express-rate-limit');

const notificationRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many notification requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { notificationRateLimiter };