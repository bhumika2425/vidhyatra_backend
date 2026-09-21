// controllers/classroomController.js
const { Classroom } = require('../models');

/**
 * Get all classrooms
 */
const getAllClassrooms = async (req, res) => {
    try {
        console.log('🏫 Fetching all classrooms');
        
        const classrooms = await Classroom.findAll({
            order: [['building', 'ASC'], ['room_number', 'ASC']]
        });

        console.log(`✅ Found ${classrooms.length} classrooms`);

        return res.status(200).json({
            success: true,
            classrooms
        });

    } catch (error) {
        console.error('❌ Error fetching classrooms:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch classrooms',
            error: error.message
        });
    }
};

/**
 * Get classroom by ID
 */
const getClassroomById = async (req, res) => {
    try {
        const { id } = req.params;

        const classroom = await Classroom.findByPk(id);

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classroom not found'
            });
        }

        return res.status(200).json({
            success: true,
            classroom
        });

    } catch (error) {
        console.error('❌ Error fetching classroom:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch classroom',
            error: error.message
        });
    }
};

/**
 * Create new classroom
 */
const createClassroom = async (req, res) => {
    try {
        console.log('🏫 Creating new classroom');
        console.log('📨 Request body:', req.body);

        const { classroom_name, room_number, building, floor, capacity, rows, columns, type, is_available } = req.body;

        // Validation
        if (!room_number || !building || !floor || !capacity || !rows || !columns || !type) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate that rows * columns >= capacity
        if (parseInt(rows) * parseInt(columns) < parseInt(capacity)) {
            return res.status(400).json({
                success: false,
                message: 'Rows × Columns must be equal to or greater than capacity'
            });
        }

        // Check if room already exists
        const existingRoom = await Classroom.findOne({
            where: { room_number, building }
        });

        if (existingRoom) {
            return res.status(400).json({
                success: false,
                message: 'Classroom with this room number already exists in this building'
            });
        }

        const classroom = await Classroom.create({
            classroom_name,
            room_number,
            building,
            floor,
            capacity: parseInt(capacity),
            rows: parseInt(rows),
            columns: parseInt(columns),
            type,
            is_available: is_available !== undefined ? is_available : true
        });

        console.log('✅ Classroom created:', classroom.id);

        return res.status(201).json({
            success: true,
            message: 'Classroom created successfully',
            classroom
        });

    } catch (error) {
        console.error('❌ Error creating classroom:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create classroom',
            error: error.message
        });
    }
};

/**
 * Update classroom
 */
const updateClassroom = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🏫 Updating classroom:', id);
        console.log('📨 Request body:', req.body);

        const classroom = await Classroom.findByPk(id);

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classroom not found'
            });
        }

        const { room_number, building, floor, capacity, rows, columns, type, is_available } = req.body;

        // Check if new room number conflicts with existing room
        if (room_number && building) {
            const existingRoom = await Classroom.findOne({
                where: { 
                    room_number, 
                    building,
                    id: { [require('sequelize').Op.ne]: id }
                }
            });

            if (existingRoom) {
                return res.status(400).json({
                    success: false,
                    message: 'Classroom with this room number already exists in this building'
                });
            }
        }

        await classroom.update({
            classroom_name: classroom_name !== undefined ? classroom_name : classroom.classroom_name,
            room_number: room_number || classroom.room_number,
            building: building || classroom.building,
            floor: floor || classroom.floor,
            capacity: capacity !== undefined ? parseInt(capacity) : classroom.capacity,
            rows: rows !== undefined ? parseInt(rows) : classroom.rows,
            columns: columns !== undefined ? parseInt(columns) : classroom.columns,
            type: type || classroom.type,
            is_available: is_available !== undefined ? is_available : classroom.is_available
        });

        console.log('✅ Classroom updated');

        return res.status(200).json({
            success: true,
            message: 'Classroom updated successfully',
            classroom
        });

    } catch (error) {
        console.error('❌ Error updating classroom:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update classroom',
            error: error.message
        });
    }
};

/**
 * Delete classroom
 */
const deleteClassroom = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🏫 Deleting classroom:', id);

        const classroom = await Classroom.findByPk(id);

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classroom not found'
            });
        }

        await classroom.destroy();

        console.log('✅ Classroom deleted');

        return res.status(200).json({
            success: true,
            message: 'Classroom deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error deleting classroom:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete classroom',
            error: error.message
        });
    }
};

/**
 * Get available classrooms for exam allocation
 */
const getAvailableClassrooms = async (req, res) => {
    try {
        const { exam_date, start_time, end_time } = req.query;

        const classrooms = await Classroom.findAll({
            where: { is_available: true },
            order: [['capacity', 'DESC']]
        });

        // TODO: Check for conflicts with existing exam allocations
        // For now, return all available classrooms

        return res.status(200).json({
            success: true,
            classrooms
        });

    } catch (error) {
        console.error('❌ Error fetching available classrooms:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch available classrooms',
            error: error.message
        });
    }
};

module.exports = {
    getAllClassrooms,
    getClassroomById,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    getAvailableClassrooms
};
