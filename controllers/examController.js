// controllers/examController.js
const { Exam, SeatAllocation, Classroom } = require('../models');
const { Op } = require('sequelize');
const notificationService = require('../services/notificationService');

/**
 * Create a new exam
 * POST /api/exams
 */
const createExam = async (req, res) => {
    try {
        console.log('📝 Creating new exam...');
        console.log('📨 Request body:', req.body);

        const {
            subject,
            module_code,
            exam_date,
            start_time,
            end_time,
            duration,
            exam_type,
            faculty,
            year,
            semester,
            section,
            total_students
        } = req.body;

        // Validate required fields
        if (!subject || !module_code || !exam_date || !start_time || !end_time || !duration || !faculty || !year || !semester) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Convert semester array to JSON string if needed
        let semesterValue = semester;
        if (Array.isArray(semester)) {
            semesterValue = JSON.stringify(semester);
        }

        // Create exam
        const exam = await Exam.create({
            subject,
            module_code,
            exam_date,
            start_time,
            end_time,
            duration,
            exam_type: exam_type || 'Final',
            faculty,
            year,
            semester: semesterValue,
            section: section || 'all',
            total_students: total_students || 0,
            status: 'draft'
        });

        console.log('✅ Exam created:', exam.id);

        return res.status(201).json({
            success: true,
            message: 'Exam created successfully',
            exam: exam
        });

    } catch (error) {
        console.error('❌ Error creating exam:', error);
        
        // Handle validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to create exam',
            error: error.message
        });
    }
};

/**
 * Get all exams with optional filters
 * GET /api/exams
 */
const getAllExams = async (req, res) => {
    try {
        console.log('📋 Fetching all exams...');
        console.log('🔍 Query params:', req.query);

        const { status, faculty, year, semester, search, page = 1, limit = 50 } = req.query;

        // Build query conditions
        const whereConditions = {};

        if (status) {
            whereConditions.status = status;
        }

        if (faculty) {
            whereConditions.faculty = faculty;
        }

        if (year) {
            whereConditions.year = year;
        }

        if (semester) {
            // Handle both single semester and "both" case
            if (semester === 'both') {
                whereConditions[Op.or] = [
                    { semester: '1st' },
                    { semester: '2nd' },
                    { semester: { [Op.like]: '%["1st","2nd"]%' } }
                ];
            } else {
                whereConditions[Op.or] = [
                    { semester: semester },
                    { semester: { [Op.like]: `%"${semester}"%` } }
                ];
            }
        }

        if (search) {
            whereConditions[Op.or] = [
                { subject: { [Op.like]: `%${search}%` } },
                { module_code: { [Op.like]: `%${search}%` } }
            ];
        }

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Fetch exams with count of allocations
        const { count, rows: exams } = await Exam.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: SeatAllocation,
                    as: 'allocations',
                    attributes: ['id'],
                    required: false
                }
            ],
            order: [['exam_date', 'DESC'], ['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        // Format response with allocation counts
        const formattedExams = exams.map(exam => {
            const examData = exam.toJSON();
            examData.allocated_students = examData.allocations ? examData.allocations.length : 0;
            delete examData.allocations;
            return examData;
        });

        console.log(`✅ Found ${count} exams`);

        return res.status(200).json({
            success: true,
            count: count,
            page: parseInt(page),
            total_pages: Math.ceil(count / parseInt(limit)),
            exams: formattedExams
        });

    } catch (error) {
        console.error('❌ Error fetching exams:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch exams',
            error: error.message
        });
    }
};

/**
 * Get exam by ID with details
 * GET /api/exams/:id
 */
const getExamById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Fetching exam with ID: ${id}`);

        const exam = await Exam.findByPk(id, {
            include: [
                {
                    model: SeatAllocation,
                    as: 'allocations',
                    attributes: ['id', 'student_id', 'college_id', 'student_name', 'classroom_id'],
                    include: [
                        {
                            model: Classroom,
                            as: 'classroom',
                            attributes: ['id', 'classroom_name', 'room_number', 'building', 'floor']
                        }
                    ],
                    required: false
                }
            ]
        });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Add computed fields
        const examData = exam.toJSON();
        examData.allocated_students = examData.allocations ? examData.allocations.length : 0;
        examData.is_published = exam.isPublished();
        examData.can_edit = exam.canEdit();

        console.log('✅ Exam found:', examData.subject);

        return res.status(200).json({
            success: true,
            exam: examData
        });

    } catch (error) {
        console.error('❌ Error fetching exam:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch exam',
            error: error.message
        });
    }
};

/**
 * Update exam
 * PUT /api/exams/:id
 */
const updateExam = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📝 Updating exam with ID: ${id}`);
        console.log('📨 Update data:', req.body);

        const exam = await Exam.findByPk(id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Check if exam can be edited
        if (!exam.canEdit()) {
            return res.status(403).json({
                success: false,
                message: 'Cannot edit published exam'
            });
        }

        const {
            subject,
            module_code,
            exam_date,
            start_time,
            end_time,
            duration,
            exam_type,
            faculty,
            year,
            semester,
            section,
            total_students
        } = req.body;

        // Convert semester array to JSON string if needed
        let semesterValue = semester;
        if (Array.isArray(semester)) {
            semesterValue = JSON.stringify(semester);
        }

        // Update fields
        const updatedData = {};
        if (subject !== undefined) updatedData.subject = subject;
        if (module_code !== undefined) updatedData.module_code = module_code;
        if (exam_date !== undefined) updatedData.exam_date = exam_date;
        if (start_time !== undefined) updatedData.start_time = start_time;
        if (end_time !== undefined) updatedData.end_time = end_time;
        if (duration !== undefined) updatedData.duration = duration;
        if (exam_type !== undefined) updatedData.exam_type = exam_type;
        if (faculty !== undefined) updatedData.faculty = faculty;
        if (year !== undefined) updatedData.year = year;
        if (semesterValue !== undefined) updatedData.semester = semesterValue;
        if (section !== undefined) updatedData.section = section;
        if (total_students !== undefined) updatedData.total_students = total_students;

        await exam.update(updatedData);

        console.log('✅ Exam updated successfully');

        return res.status(200).json({
            success: true,
            message: 'Exam updated successfully',
            exam: exam
        });

    } catch (error) {
        console.error('❌ Error updating exam:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to update exam',
            error: error.message
        });
    }
};

/**
 * Delete exam
 * DELETE /api/exams/:id
 */
const deleteExam = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ Deleting exam with ID: ${id}`);

        const exam = await Exam.findByPk(id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Check if exam is published
        if (exam.isPublished()) {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete published exam. Unpublish it first.'
            });
        }

        // Delete exam (cascades to seat_allocations due to ON DELETE CASCADE)
        await exam.destroy();

        console.log('✅ Exam deleted successfully');

        return res.status(200).json({
            success: true,
            message: 'Exam deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting exam:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete exam',
            error: error.message
        });
    }
};

/**
 * Update exam status
 * PATCH /api/exams/:id/status
 */
const updateExamStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log(`📝 Updating exam ${id} status to: ${status}`);

        if (!['draft', 'allocated', 'published'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be draft, allocated, or published'
            });
        }

        const exam = await Exam.findByPk(id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Validate status transition
        if (status === 'published') {
            // Check if seats are allocated
            const allocationCount = await SeatAllocation.count({
                where: { exam_id: id }
            });

            if (allocationCount === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot publish exam without seat allocations'
                });
            }

            if (allocationCount !== exam.total_students) {
                return res.status(400).json({
                    success: false,
                    message: `Seat allocation incomplete. Expected ${exam.total_students} students, but only ${allocationCount} allocated`
                });
            }
        }

        await exam.update({ status });

        console.log('✅ Status updated successfully');

        // 🎯 Send notifications when exam is published
        if (status === 'published') {
            try {
                // Get all allocations for this exam
                const allocations = await SeatAllocation.findAll({
                    where: { exam_id: id },
                    attributes: ['college_id', 'student_name', 'classroom_id', 'seat_number']
                });

                // Get unique college IDs
                const collegeIds = [...new Set(allocations.map(a => a.college_id))];

                // Fetch users from User model (college_id is in users table)
                const User = require('../models/user');
                const users = await User.findAll({
                    where: {
                        college_id: collegeIds
                    },
                    attributes: ['user_id', 'college_id']
                });

                console.log(`📢 Publishing exam - Found ${users.length} students to notify`);

                if (users.length > 0) {
                    const userIds = users.map(user => user.user_id);
                    
                    // Format exam details
                    const examDate = new Date(exam.exam_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                    });
                    const examTime = `${exam.start_time.substring(0, 5)} - ${exam.end_time.substring(0, 5)}`;
                    
                    // Prepare notification data
                    const notificationData = {
                        title: 'Exam Seat Plan Published',
                        message: `The seat plan for ${exam.subject} exam on ${examDate} at ${examTime} has been published. Please check your assigned seat.`,
                        type: 'EXAM_SEAT_ALERT',
                        priority: 'URGENT',
                        data: {
                            exam_id: exam.id,
                            subject: exam.subject,
                            module_code: exam.module_code,
                            exam_date: exam.exam_date,
                            start_time: exam.start_time,
                            end_time: exam.end_time,
                            exam_type: exam.exam_type,
                            status: 'published'
                        }
                    };

                    // Send notifications to all students
                    await notificationService.sendToMultipleUsers(userIds, notificationData);
                    
                    console.log(`✅ Exam published notifications sent to ${userIds.length} students`);
                } else {
                    console.log('⚠️ No users found for allocated students');
                }
            } catch (notificationError) {
                // Log error but don't fail the status update
                console.error('❌ Error sending exam published notifications:', notificationError);
            }
        }

        return res.status(200).json({
            success: true,
            message: `Exam status updated to ${status}`,
            exam: exam
        });

    } catch (error) {
        console.error('❌ Error updating status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        });
    }
};

module.exports = {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam,
    updateExamStatus
};
