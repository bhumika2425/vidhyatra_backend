// controllers/allocationController.js
const { Exam, SeatAllocation, Classroom } = require('../models');
const { sequelizeIcpStudents } = require('../config/db');
const { Op } = require('sequelize');
const notificationService = require('../services/notificationService');

/**
 * Generate seat allocation for an exam
 * POST /api/exams/:id/allocate
 */
const generateAllocation = async (req, res) => {
    try {
        const { id: examId } = req.params;
        const { classroomIds, strategy = 'random_mixed' } = req.body;

        console.log(`🎲 Generating allocation for exam ${examId}`);
        console.log(`📋 Strategy: ${strategy}, Classrooms: ${classroomIds}`);

        // Validate input
        if (!classroomIds || classroomIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one classroom must be selected'
            });
        }

        // Get exam details
        const exam = await Exam.findByPk(examId);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Check if already allocated
        const existingAllocations = await SeatAllocation.count({
            where: { exam_id: examId }
        });

        if (existingAllocations > 0) {
            return res.status(400).json({
                success: false,
                message: 'Seats already allocated. Delete existing allocations first or use manual modification.'
            });
        }

        // Get selected classrooms
        const classrooms = await Classroom.findAll({
            where: { id: classroomIds }
        });

        if (classrooms.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No valid classrooms found'
            });
        }

        // Calculate total capacity
        const totalCapacity = classrooms.reduce((sum, c) => sum + c.capacity, 0);
        if (totalCapacity < exam.total_students) {
            return res.status(400).json({
                success: false,
                message: `Insufficient capacity. Need ${exam.total_students} seats but only ${totalCapacity} available.`
            });
        }

        // Fetch eligible students from icp_students database
        const students = await fetchEligibleStudents(exam);

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No eligible students found'
            });
        }

        console.log(`👥 Found ${students.length} eligible students`);

        // Apply allocation strategy
        let orderedStudents;
        switch (strategy) {
            case 'random_mixed':
                orderedStudents = shuffleArray([...students]);
                break;
            case 'section_separated':
                orderedStudents = sectionSeparatedAllocation(students);
                break;
            case 'roll_number':
                orderedStudents = students.sort((a, b) => 
                    a.college_id.localeCompare(b.college_id)
                );
                break;
            default:
                orderedStudents = shuffleArray([...students]);
        }

        // Distribute students across classrooms
        const allocations = distributeStudentsToClassrooms(
            orderedStudents,
            classrooms,
            strategy
        );

        // Bulk insert allocations
        const allocationRecords = allocations.map(allocation => ({
            exam_id: examId,
            student_id: allocation.student_id,
            college_id: allocation.college_id,
            student_name: allocation.student_name,
            classroom_id: allocation.classroom_id,
            seat_number: allocation.seat_number,
            row_number: allocation.row_number,
            column_number: allocation.column_number,
            allocation_strategy: strategy
        }));

        await SeatAllocation.bulkCreate(allocationRecords);

        // Update exam status
        await exam.update({ status: 'allocated' });

        console.log(`✅ Allocation complete: ${allocationRecords.length} seats assigned`);
        console.log(`ℹ️ Notifications will be sent when admin publishes the exam`);

        // Fetch complete allocations with classroom details
        const completeAllocations = await SeatAllocation.findAll({
            where: { exam_id: examId },
            include: [{
                model: Classroom,
                as: 'classroom',
                attributes: ['id', 'classroom_name', 'room_number', 'building', 'floor', 'capacity', 'rows', 'columns']
            }],
            order: [['classroom_id', 'ASC'], ['seat_number', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Seat allocation generated successfully',
            allocations: completeAllocations,
            summary: {
                total_allocated: allocationRecords.length,
                strategy: strategy,
                classrooms_used: classrooms.length
            }
        });

    } catch (error) {
        console.error('❌ Error generating allocation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate allocation',
            error: error.message
        });
    }
};

/**
 * Get allocations for an exam
 * GET /api/exams/:id/allocations
 */
const getAllocations = async (req, res) => {
    try {
        const { id: examId } = req.params;

        const allocations = await SeatAllocation.findAll({
            where: { exam_id: examId },
            include: [{
                model: Classroom,
                as: 'classroom',
                attributes: ['id', 'classroom_name', 'room_number', 'building', 'floor', 'rows', 'columns']
            }],
            order: [['classroom_id', 'ASC'], ['seat_number', 'ASC']]
        });

        // Group by classroom
        const groupedByClassroom = allocations.reduce((acc, allocation) => {
            const classroomId = allocation.classroom_id;
            if (!acc[classroomId]) {
                acc[classroomId] = {
                    classroom: allocation.classroom,
                    allocations: []
                };
            }
            acc[classroomId].allocations.push(allocation);
            return acc;
        }, {});

        return res.status(200).json({
            success: true,
            allocations: allocations,
            grouped: Object.values(groupedByClassroom),
            total: allocations.length
        });

    } catch (error) {
        console.error('❌ Error fetching allocations:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch allocations',
            error: error.message
        });
    }
};

/**
 * Swap two seat allocations
 * POST /api/allocations/swap
 */
const swapSeats = async (req, res) => {
    try {
        const { allocation1Id, allocation2Id } = req.body;

        console.log(`🔄 Swapping seats: ${allocation1Id} ↔ ${allocation2Id}`);

        const allocation1 = await SeatAllocation.findByPk(allocation1Id);
        const allocation2 = await SeatAllocation.findByPk(allocation2Id);

        if (!allocation1 || !allocation2) {
            return res.status(404).json({
                success: false,
                message: 'One or both allocations not found'
            });
        }

        // Check if same exam
        if (allocation1.exam_id !== allocation2.exam_id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot swap seats from different exams'
            });
        }

        // Swap seat details
        const temp = {
            classroom_id: allocation1.classroom_id,
            seat_number: allocation1.seat_number,
            row_number: allocation1.row_number,
            column_number: allocation1.column_number
        };

        await allocation1.update({
            classroom_id: allocation2.classroom_id,
            seat_number: allocation2.seat_number,
            row_number: allocation2.row_number,
            column_number: allocation2.column_number
        });

        await allocation2.update({
            classroom_id: temp.classroom_id,
            seat_number: temp.seat_number,
            row_number: temp.row_number,
            column_number: temp.column_number
        });

        console.log('✅ Seats swapped successfully');

        return res.status(200).json({
            success: true,
            message: 'Seats swapped successfully',
            allocations: [allocation1, allocation2]
        });

    } catch (error) {
        console.error('❌ Error swapping seats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to swap seats',
            error: error.message
        });
    }
};

/**
 * Update a single allocation manually
 * PUT /api/allocations/:id
 */
const updateAllocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { classroom_id, seat_number, row_number, column_number } = req.body;

        const allocation = await SeatAllocation.findByPk(id);
        if (!allocation) {
            return res.status(404).json({
                success: false,
                message: 'Allocation not found'
            });
        }

        // Check if new seat is available
        if (classroom_id && seat_number) {
            const existing = await SeatAllocation.findOne({
                where: {
                    exam_id: allocation.exam_id,
                    classroom_id: classroom_id,
                    seat_number: seat_number,
                    id: { [Op.ne]: id }
                }
            });

            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'This seat is already occupied'
                });
            }
        }

        await allocation.update({
            classroom_id: classroom_id || allocation.classroom_id,
            seat_number: seat_number || allocation.seat_number,
            row_number: row_number || allocation.row_number,
            column_number: column_number || allocation.column_number
        });

        console.log(`✅ Allocation ${id} updated`);

        return res.status(200).json({
            success: true,
            message: 'Allocation updated successfully',
            allocation: allocation
        });

    } catch (error) {
        console.error('❌ Error updating allocation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update allocation',
            error: error.message
        });
    }
};

/**
 * Delete all allocations for an exam (reset)
 * DELETE /api/exams/:id/allocations
 */
const deleteAllocations = async (req, res) => {
    try {
        const { id: examId } = req.params;

        const deleted = await SeatAllocation.destroy({
            where: { exam_id: examId }
        });

        // Update exam status back to draft
        await Exam.update(
            { status: 'draft' },
            { where: { id: examId } }
        );

        console.log(`🗑️ Deleted ${deleted} allocations for exam ${examId}`);

        return res.status(200).json({
            success: true,
            message: `Deleted ${deleted} seat allocations`,
            count: deleted
        });

    } catch (error) {
        console.error('❌ Error deleting allocations:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete allocations',
            error: error.message
        });
    }
};

// ========== Helper Functions ==========

/**
 * Fetch eligible students from icp_students database
 */
async function fetchEligibleStudents(exam) {
    try {
        // Parse semester - could be "1st", "2nd", or JSON array ["1st","2nd"]
        let semesterValues = [];
        let semesterValue = exam.semester;

        try {
            // Try parsing as JSON array
            const parsed = JSON.parse(semesterValue);
            if (Array.isArray(parsed)) {
                semesterValues = parsed; // Keep "1st", "2nd" format
            } else {
                semesterValues = [semesterValue]; // Keep as is
            }
        } catch {
            // Not JSON, treat as single value
            semesterValues = [semesterValue]; // Keep as is
        }

        console.log('🔍 Querying students with:', {
            department: exam.faculty,
            year: exam.year,
            semester: semesterValues
        });

        // Build the SQL query dynamically based on number of semesters
        let sqlQuery;
        let replacements = {
            department: exam.faculty,
            year: exam.year // Keep original format (1st, 2nd, 3rd)
        };

        if (semesterValues.length === 1) {
            sqlQuery = `
                SELECT student_id, college_id, name, department, year, semester, section 
                FROM students 
                WHERE department = :department 
                AND year = :year 
                AND semester = :semester1
                ${exam.section !== 'all' ? 'AND section = :section' : ''}
                ORDER BY college_id
            `;
            replacements.semester1 = semesterValues[0];
        } else {
            // Multiple semesters - use IN clause with explicit values
            const semesterPlaceholders = semesterValues.map((_, i) => `:semester${i}`).join(', ');
            sqlQuery = `
                SELECT student_id, college_id, name, department, year, semester, section 
                FROM students 
                WHERE department = :department 
                AND year = :year 
                AND semester IN (${semesterPlaceholders})
                ${exam.section !== 'all' ? 'AND section = :section' : ''}
                ORDER BY college_id
            `;
            semesterValues.forEach((val, i) => {
                replacements[`semester${i}`] = val;
            });
        }

        if (exam.section !== 'all') {
            replacements.section = exam.section;
        }

        const [students] = await sequelizeIcpStudents.query(sqlQuery, {
            replacements: replacements
        });

        console.log(`✅ Found ${students.length} students`);

        return students.map(student => ({
            student_id: student.student_id,
            college_id: student.college_id,
            student_name: student.name,
            section: student.section
        }));

    } catch (error) {
        console.error('❌ Error fetching students:', error);
        throw error;
    }
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Section separated allocation - keeps sections separate but shuffles within
 */
function sectionSeparatedAllocation(students) {
    const sections = {};
    
    // Group by section
    students.forEach(student => {
        const section = student.section || 'default';
        if (!sections[section]) {
            sections[section] = [];
        }
        sections[section].push(student);
    });

    // Shuffle within each section
    Object.keys(sections).forEach(section => {
        sections[section] = shuffleArray(sections[section]);
    });

    // Alternate between sections
    const sectionKeys = Object.keys(sections);
    const result = [];
    let index = 0;

    while (Object.values(sections).some(arr => arr.length > 0)) {
        const section = sectionKeys[index % sectionKeys.length];
        if (sections[section].length > 0) {
            result.push(sections[section].shift());
        }
        index++;
    }

    return result;
}

/**
 * Distribute students across classrooms with equal distribution
 * Example: 35 students, 2 classrooms of 28 seats = 18 in first, 17 in second
 */
function distributeStudentsToClassrooms(students, classrooms, strategy) {
    const allocations = [];
    
    // Sort classrooms by capacity (largest first)
    const sortedClassrooms = classrooms.sort((a, b) => b.capacity - a.capacity);
    
    // Calculate how many students per classroom for equal distribution
    const totalStudents = students.length;
    const totalClassrooms = sortedClassrooms.length;
    const baseStudentsPerClassroom = Math.floor(totalStudents / totalClassrooms);
    const remainingStudents = totalStudents % totalClassrooms;
    
    console.log(`📊 Distribution Plan: ${totalStudents} students across ${totalClassrooms} classrooms`);
    console.log(`   Base: ${baseStudentsPerClassroom} students per classroom`);
    console.log(`   Extra: ${remainingStudents} students to distribute`);
    
    // Calculate how many students each classroom should get
    const classroomAllocations = sortedClassrooms.map((classroom, index) => ({
        classroom: classroom,
        studentsToAllocate: baseStudentsPerClassroom + (index < remainingStudents ? 1 : 0),
        currentSeat: 0
    }));
    
    // Log the distribution plan
    classroomAllocations.forEach((ca, index) => {
        console.log(`   Classroom ${index + 1} (${ca.classroom.classroom_name || ca.classroom.room_number}): ${ca.studentsToAllocate} students`);
    });
    
    // Distribute students
    let studentIndex = 0;
    for (const classroomAlloc of classroomAllocations) {
        const { classroom, studentsToAllocate } = classroomAlloc;
        
        for (let i = 0; i < studentsToAllocate; i++) {
            if (studentIndex >= students.length) break;
            
            const student = students[studentIndex];
            const seatNumber = i + 1;
            const rowNumber = Math.floor(i / classroom.columns) + 1;
            const columnNumber = (i % classroom.columns) + 1;

            allocations.push({
                ...student,
                classroom_id: classroom.id,
                seat_number: seatNumber,
                row_number: rowNumber,
                column_number: columnNumber
            });
            
            studentIndex++;
        }
    }

    return allocations;
}

module.exports = {
    generateAllocation,
    getAllocations,
    swapSeats,
    updateAllocation,
    deleteAllocations
};
