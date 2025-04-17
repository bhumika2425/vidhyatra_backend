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

// Admin: Post a new exam
const createExam = async (req, res) => {
    const { title, description, venue, exam_date, exam_start_time, exam_duration, year } = req.body;

    try {
        const formattedDate = new Date(exam_date).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];

        if (formattedDate < today) {
            return res.status(400).json({ message: 'Exam date cannot be in the past.' });
        }

        const validYears = ['1st year', '2nd Year', '3rd Year'];
        if (!validYears.includes(year)) {
            return res.status(400).json({ message: 'Invalid year. Must be one of: 1st year, 2nd Year, 3rd Year.' });
        }

        const newExam = await Academic.create({
            title,
            description,
            venue,
            exam_date: formattedDate,
            exam_start_time,
            exam_duration,
            year,
            created_by: req.admin.admin_id,
        });

        res.status(201).json({ message: 'Exam created successfully.', exam: newExam });
    } catch (error) {
        res.status(500).json({ message: 'Error creating exam.', error: error.message });
    }
};

// Users & Admin: Get exams (users get only exams for their year)
const getExams = async (req, res) => {
    try {
        let filter = {};

        // If a user is logged in (not admin), filter by their academic year
        if (req.user && req.user.year && !req.admin) {
            filter.year = req.user.year;
        }

        const exams = await Academic.findAll({
            where: filter,
            attributes: {
                exclude: ['exam_id', 'created_by']
            },
            order: [['exam_date', 'ASC']],
        });

        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exams.', error: error.message });
    }
};

// Users: Get exams by specific date (with year filter if user)
const getExamsByDate = async (req, res) => {
    let { date } = req.params;

    try {
        let filter = { exam_date: date };

        if (req.user && req.user.year && !req.admin) {
            filter.year = req.user.year;
        }

        const exams = await Academic.findAll({ where: filter });

        res.status(200).json(exams);
    } catch (error) {
        console.error("Error fetching exams:", error);
        res.status(500).json({ message: 'Error fetching exams for the date.', error: error.message });
    }
};

module.exports = {
    createExam,
    getExams,
    getExamsByDate,
};
