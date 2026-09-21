// controllers/studentController.js
const IcpStudent = require('../models/icpModels/Student');
const { Op } = require('sequelize');

/**
 * Get count of students from ICP Students database
 * Used for exam seat planning to determine total eligible students
 */
const getStudentCount = async (req, res) => {
    try {
        console.log('🎯 getStudentCount called');
        console.log('📨 Request body:', req.body);
        console.log('🔐 Auth user:', req.user ? `ID: ${req.user.user_id}` : 'Not authenticated');
        
        const { department, year, semester } = req.body;

        // Build query conditions
        const whereConditions = {};
        
        if (department) {
            whereConditions.department = department;
        }
        
        if (year) {
            whereConditions.year = year;
        }
        
        if (semester) {
            // Accept either a single semester ("1st"/"2nd"), an array, or the special value 'both'
            if (Array.isArray(semester)) {
                whereConditions.semester = { [Op.in]: semester };
            } else if (typeof semester === 'string' && semester.toLowerCase() === 'both') {
                whereConditions.semester = { [Op.in]: ['1st', '2nd'] };
            } else {
                whereConditions.semester = semester;
            }
        }

        console.log('🔍 Query conditions:', whereConditions);

        // Count students from icp_students database
        const count = await IcpStudent.count({
            where: whereConditions
        });

        console.log('✅ Count result:', count);

        return res.status(200).json({
            success: true,
            count: count,
            filters: {
                department,
                year,
                semester
            }
        });

    } catch (error) {
        console.error('❌ Error counting students:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to count students',
            error: error.message
        });
    }
};

/**
 * Get eligible students for exam seat allocation
 * Returns full student list from ICP database
 */
const getEligibleStudents = async (req, res) => {
    try {
        const { department, year, semester, section } = req.body;

        // Build query conditions
        const whereConditions = {};
        
        if (department) {
            whereConditions.department = department;
        }
        
        if (year) {
            whereConditions.year = year;
        }
        
        if (semester) {
            if (Array.isArray(semester)) {
                whereConditions.semester = { [Op.in]: semester };
            } else if (typeof semester === 'string' && semester.toLowerCase() === 'both') {
                whereConditions.semester = { [Op.in]: ['1st', '2nd'] };
            } else {
                whereConditions.semester = semester;
            }
        }

        if (section && section !== 'all') {
            whereConditions.section = section;
        }

        // Get students from icp_students database
        const students = await IcpStudent.findAll({
            where: whereConditions,
            attributes: ['student_id', 'college_id', 'name', 'college_email', 'department', 'year', 'semester', 'section'],
            order: [['name', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            count: students.length,
            students: students
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch students',
            error: error.message
        });
    }
};

module.exports = {
    getStudentCount,
    getEligibleStudents
};
