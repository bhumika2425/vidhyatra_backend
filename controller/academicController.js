// // Academic Controller
// const Academic = require('../models/academicModel');

// // Admin: Post a new exam
// const createExam = async (req, res) => {
//     const { title, description, venue, exam_date, exam_start_time, exam_duration,year } = req.body;

//     try {
//         // Ensure exam_date only contains YYYY-MM-DD
//         const formattedDate = new Date(exam_date).toISOString().split('T')[0];
//         // Check if the exam date is in the past
//         const today = new Date().toISOString().split('T')[0];
//         if (formattedDate < today) {
//             return res.status(400).json({ message: 'Exam date cannot be in the past.' });
//         }
//          // Validate year
//         const validYears = ['1st year', '2nd Year', '3rd Year'];
//         if (!validYears.includes(year)) {
//             return res.status(400).json({ message: 'Invalid year. Must be one of: 1st year, 2nd Year, 3rd Year.' });
//         }

//         const newExam = await Academic.create({
//             title,
//             description,
//             venue,
//             exam_date: formattedDate,
//             exam_start_time,
//             exam_duration,
//             year,
//             created_by: req.admin.admin_id,
//         });

//         res.status(201).json({ message: 'Exam created successfully.', exam: newExam });
//     } catch (error) {
//         res.status(500).json({ message: 'Error creating exam.', error: error.message });
//     }
// };

// // Users: Get all exams
// const getExams = async (req, res) => {
//     try {
//         const exams = await Academic.findAll({
//             attributes: {
//                 exclude: ['exam_id', 'created_by'] // Exclude these fields
//             },
//             order: [['exam_date', 'ASC']], // Sort exams by date
//         });
//         res.status(200).json(exams);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching exams.', error: error.message });
//     }
// };

// // Users: Get exams for a specific date
// const getExamsByDate = async (req, res) => {
//     let { date } = req.params;

//     try {
//         const exams = await Academic.findAll({ where: { exam_date: date } });
//         res.status(200).json(exams);
//     } catch (error) {
//         console.error("Error fetching exams:", error);
//         res.status(500).json({ message: 'Error fetching exams for the date.', error: error.message });
//     }
// };

// module.exports = {
//     createExam,
//     getExams,
//     getExamsByDate,
// };

const Academic = require('../models/academicModel');
const { Op } = require('sequelize');
const Admin = require('../models/adminModel');

// Create a new academic calendar event (exam or holiday)
const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            eventType,
            examType,
            subject,
            holidayType,
            startDate,
            endDate,
            startTime,
            duration,
            venue,
            year,
            semester
        } = req.body;

        // Validate event type
        if (!Academic.EVENT_TYPES.includes(eventType)) {
            return res.status(400).json({
                message: `Invalid event type. Must be one of: ${Academic.EVENT_TYPES.join(', ')}`
            });
        }

        // Create the event with mandatory fields
        const eventData = {
            title,
            description,
            eventType,
            startDate,
            endDate,
            year,
            semester,
            created_by: req.admin.admin_id
        };

        // Add exam-specific fields
        if (eventType === 'EXAM') {
            if (!examType || !startTime || !duration || !venue || !subject) {
                return res.status(400).json({
                    message: 'For exam events, examType, startTime, duration, venue, and subject are required'
                });
            }
            Object.assign(eventData, { examType, startTime, duration, venue, subject });
        }

        // Add holiday-specific fields
        if (eventType === 'HOLIDAY') {
            if (!holidayType) {
                return res.status(400).json({
                    message: 'For holiday events, holidayType is required'
                });
            }
            eventData.holidayType = holidayType;
        }

        const newEvent = await Academic.create(eventData);

        res.status(201).json({
            message: `${eventType.toLowerCase()} created successfully.`,
            event: newEvent
        });
    } catch (error) {
        console.error('Error creating academic event:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }
        res.status(500).json({
            message: 'Error creating academic event.',
            error: error.message
        });
    }
};

// Get academic calendar events with filtering options
const getEvents = async (req, res) => {
    try {
        const {
            eventType,
            startDate,
            endDate,
            year,
            semester,
            examType,
            holidayType
        } = req.query;

        let filter = {};

        // If user is not admin, filter by their year
        if (req.user && req.user.year && !req.admin) {
            filter.year = req.user.year;
        }

        // Apply optional filters
        if (eventType && Academic.EVENT_TYPES.includes(eventType)) {
            filter.eventType = eventType;
        }
        if (year && Academic.ACADEMIC_YEARS.includes(year)) {
            filter.year = year;
        }
        if (semester && Academic.SEMESTERS.includes(semester)) {
            filter.semester = semester;
        }
        if (examType && eventType === 'EXAM' && Academic.EXAM_TYPES.includes(examType)) {
            filter.examType = examType;
        }
        if (holidayType && eventType === 'HOLIDAY' && Academic.HOLIDAY_TYPES.includes(holidayType)) {
            filter.holidayType = holidayType;
        }

        // Date range filter
        if (startDate || endDate) {
            filter.startDate = {};
            if (startDate) {
                filter.startDate[Op.gte] = startDate;
            }
            if (endDate) {
                filter.startDate[Op.lte] = endDate;
            }
        }

        const events = await Academic.findAll({
            where: filter,
            include: [{
                model: Admin,
                as: 'creator',
                attributes: ['name', 'email']
            }],
            order: [
                ['startDate', 'ASC'],
                ['startTime', 'ASC']
            ]
        });

        res.status(200).json({
            count: events.length,
            events
        });
    } catch (error) {
        console.error('Error fetching academic events:', error);
        res.status(500).json({
            message: 'Error fetching academic events.',
            error: error.message
        });
    }
};

// Get a specific event by ID
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Academic.findOne({
            where: {
                id,
                ...(req.user && req.user.year && !req.admin ? { year: req.user.year } : {})
            },
            include: [{
                model: Admin,
                as: 'creator',
                attributes: ['name', 'email']
            }]
        });

        if (!event) {
            return res.status(404).json({
                message: 'Academic event not found'
            });
        }

        res.status(200).json(event);
    } catch (error) {
        console.error('Error fetching academic event:', error);
        res.status(500).json({
            message: 'Error fetching academic event.',
            error: error.message
        });
    }
};

// Update an academic event
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Academic.findOne({
            where: { id, created_by: req.admin.admin_id }
        });

        if (!event) {
            return res.status(404).json({
                message: 'Academic event not found or you do not have permission to update it'
            });
        }

        const updateData = { ...req.body };
        delete updateData.created_by; // Prevent updating the creator

        await event.update(updateData);

        const updatedEvent = await Academic.findByPk(id, {
            include: [{
                model: Admin,
                as: 'creator',
                attributes: ['name', 'email']
            }]
        });

        res.status(200).json({
            message: 'Academic event updated successfully',
            event: updatedEvent
        });
    } catch (error) {
        console.error('Error updating academic event:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }
        res.status(500).json({
            message: 'Error updating academic event.',
            error: error.message
        });
    }
};

// Delete an academic event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Academic.findOne({
            where: { id, created_by: req.admin.admin_id }
        });

        if (!event) {
            return res.status(404).json({
                message: 'Academic event not found or you do not have permission to delete it'
            });
        }

        await event.destroy();

        res.status(200).json({
            message: 'Academic event deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting academic event:', error);
        res.status(500).json({
            message: 'Error deleting academic event.',
            error: error.message
        });
    }
};

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent
};
