// services/userService.js
const jwt = require('jsonwebtoken'); 
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Profile = require('../models/profileModel');
const IcpStudent = require('../models/icpModels/Student');
const IcpTeacher = require('../models/icpModels/Teacher');
const { sequelizeVidhyatra } = require('../config/db');

const registerUser = async (collegeId, email, password, confirmPassword) => {
    // Validate password confirmation
    if (password !== confirmPassword) {
        const error = new Error('Password and confirm password do not match.');
        error.statusCode = 400;
        throw error;
    }

    // Check if email is already registered in Vidhyatra app
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        const error = new Error('Email already registered in Vidhyatra. Please use a different email.');
        error.statusCode = 409;
        throw error;
    }

    // Check if college ID is already registered in Vidhyatra app
    const existingCollegeId = await User.findOne({ where: { college_id: collegeId } });
    if (existingCollegeId) {
        const error = new Error('College ID already registered in Vidhyatra. Please contact support if this is an error.');
        error.statusCode = 409;
        throw error;
    }

    try {
        let icpData = null;
        let role = null;

        // Auto-determine role: First check if user is a student
        // console.log(`🔍 Checking college database for collegeId: ${collegeId}, email: ${email}`);
        
        // try {
        //     icpData = await IcpStudent.findOne({
        //         where: {
        //             college_id: collegeId,
        //             college_email: email
        //         }
        //     });

        //     if (icpData) {
        //         role = 'Student';
        //         console.log('✅ Found as Student in college database');
        //     }
        // } catch (error) {
        //     console.log('Error checking student database:', error.message);
        // }

        // // If not found in students table, check teachers table
        // if (!icpData) {
        //     try {
        //         icpData = await IcpTeacher.findOne({
        //             where: {
        //                 college_id: collegeId,
        //                 college_email: email
        //             }
        //         });

        //         if (icpData) {
        //             role = 'Teacher';
        //             console.log('✅ Found as Teacher in college database');
        //         }
        //     } catch (error) {
        //         console.log('Error checking teacher database:', error.message);
        //     }
        // }

        // // If not found in either table, reject registration
        // if (!icpData || !role) {
        //     const error = new Error('College ID or email not found in college database. Please verify your details.');
        //     error.statusCode = 400;
        //     throw error;
        // }
        // ...existing code...
        // Auto-determine role: First check if user is a student
        console.log(`🔍 Checking college database for collegeId: ${collegeId}, email: ${email}`);
        
        try {
            console.log('📊 Attempting to query IcpStudent model...');
            console.log('🔑 IcpStudent primary key:', IcpStudent.primaryKeyAttribute);
            console.log('📋 IcpStudent attributes:', Object.keys(IcpStudent.rawAttributes));
            
            icpData = await IcpStudent.findOne({
                where: {
                    college_id: collegeId,
                    college_email: email
                },
                raw: true // Get plain object
            });

            if (icpData) {
                role = 'Student';
                console.log('✅ Found as Student in college database');
                console.log('📦 Student data:', JSON.stringify(icpData, null, 2));
            } else {
                console.log('❌ Not found in students table');
            }
        } catch (error) {
            console.log('❌ Error checking student database:', error.message);
            console.log('🔍 Error details:', error.original?.sqlMessage || error.stack);
        }

        // If not found in students table, check teachers table
        if (!icpData) {
            try {
                console.log('📊 Attempting to query IcpTeacher model...');
                console.log('🔑 IcpTeacher primary key:', IcpTeacher.primaryKeyAttribute);
                console.log('📋 IcpTeacher attributes:', Object.keys(IcpTeacher.rawAttributes));
                
                icpData = await IcpTeacher.findOne({
                    where: {
                        college_id: collegeId,
                        college_email: email
                    },
                    raw: true // Get plain object
                });

                if (icpData) {
                    role = 'Teacher';
                    console.log('✅ Found as Teacher in college database');
                    console.log('📦 Teacher data:', JSON.stringify(icpData, null, 2));
                } else {
                    console.log('❌ Not found in teachers table');
                }
            } catch (error) {
                console.log('❌ Error checking teacher database:', error.message);
                console.log('🔍 Error details:', error.original?.sqlMessage || error.stack);
            }
        }

        // If not found in either table, reject registration
        if (!icpData || !role) {
            console.log('⚠️ User not found in either students or teachers table');
            console.log(`📋 Search criteria - collegeId: ${collegeId}, email: ${email}`);
            const error = new Error('College ID or email not found in college database. Please verify your details.');
            error.statusCode = 400;
            throw error;
        }
// ...existing code...

        // Helper functions to map ICP values to Profile enum values
        const mapYear = (year) => {
            const yearMap = { 
                '1st': '1st Year', 
                '2nd': '2nd Year', 
                '3rd': '3rd Year',
                '1': '1st Year',
                '2': '2nd Year', 
                '3': '3rd Year'
            };
            return yearMap[year] || year; // Return original if no mapping found
        };

        const mapSemester = (semester) => {
            const semesterMap = { 
                '1st': 'Semester 1', 
                '2nd': 'Semester 2',
                '1': 'Semester 1',
                '2': 'Semester 2'
            };
            return semesterMap[semester] || semester; // Return original if no mapping found
        };

        // Start transaction for user and profile creation
        const transaction = await sequelizeVidhyatra.transaction();

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Create user
            const newUser = await User.create({
                college_id: collegeId,
                name: icpData.name, // Use name from ICP database
                email,
                password: hashedPassword,
                role
            }, { transaction });

            // Create comprehensive profile with ALL college data stored in vidhyatra database
            const profileData = {
                user_id: newUser.user_id,
                full_name: icpData.name,
                department: icpData.department,
                phone_number: icpData.phone_number,
                profileImageUrl: icpData.profile_image,
                college_email: icpData.college_email, // Store college email for all users
                // Initialize personal fields as null (can be updated later)
                bio: null,
                interest: null,
                date_of_birth: null,
                location: null
            };

            // Add role-specific data to profileData
            if (role === 'Student') {
                Object.assign(profileData, {
                    year: mapYear(icpData.year),
                    semester: mapSemester(icpData.semester),
                    section: icpData.section
                });
            }

            if (role === 'Teacher') {
                Object.assign(profileData, {
                    subject: icpData.subject || null,
                    qualification: icpData.qualification || null
                });
            }

            // Create profile with complete college data stored locally
            const newProfile = await Profile.create(profileData, { transaction });

            // Auto-verify email for college users
            if (role === 'Teacher') {
                await newUser.update({
                    email_verified: true
                }, { transaction });
            }

            await transaction.commit();

            // Prepare simplified response with user data including profile info
            const responseData = {
                message: `User registered successfully as ${role} with auto-generated profile`,
                user: {
                    user_id: newUser.user_id,
                    college_id: newUser.college_id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role, // Auto-determined role
                    department: profileData.department,
                    phone_number: profileData.phone_number,
                    profileImageUrl: profileData.profileImageUrl,
                    createdAt: newUser.created_at
                }
            };

            // Add student-specific details to user object
            if (role === 'Student') {
                responseData.user.year = profileData.year;
                responseData.user.semester = profileData.semester;
                responseData.user.section = profileData.section;
            }

            return responseData;

        } catch (transactionError) {
            await transaction.rollback();
            throw transactionError;
        }

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
            error.message = 'Server error during registration. Please try again.';
        }
        throw error;
    }
};

const loginUser = async (identifier, password) => {
    try {
        console.log('🔍 userService.loginUser called with identifier:', identifier);
        
        // Find user by email or college_id
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: identifier },
                    { college_id: identifier }
                ]
            }
        });

        console.log('   User found:', user ? `${user.name} (${user.email})` : 'NOT FOUND');

        if (!user) {
            console.log('   ❌ User not found');
            throw new Error('Invalid credentials.');
        }

        console.log('   User details:');
        console.log('      - user_id:', user.user_id);
        console.log('      - name:', user.name);
        console.log('      - email:', user.email);
        console.log('      - role:', user.role);
        console.log('      - isAdmin:', user.isAdmin);

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('   Password match:', isMatch);
        
        if (!isMatch) {
            console.log('   ❌ Password mismatch');
            throw new Error('Invalid credentials.');
        }

        // Generate JWT token with isAdmin flag
        const tokenPayload = { 
            user_id: user.user_id, 
            role: user.role,
            isAdmin: user.isAdmin || false  // ✅ Include isAdmin in token
        };
        
        console.log('   Creating JWT token with payload:', tokenPayload);
        
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('   ✅ Token created successfully');

        // Return minimal user data for security and performance
        const loginResponse = {
            message: 'Login successful!',
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                isAdmin: user.isAdmin || false
            },
            token
        };

        console.log('   📦 Login response prepared');
        return loginResponse;
    } catch (error) {
        console.error('   ❌ Login error in userService:', error.message);
        throw new Error(error.message || 'Login failed.');
    }
};

const getAllUsers = async (currentUserId) => {
    try {
        const users = await User.findAll({
            where: {
                user_id: { [Op.ne]: currentUserId },  // Exclude the current user's ID
                isAdmin: false // Exclude admin users
            },
            attributes: { exclude: ['password', 'otp', 'otpExpiry'] }, // Exclude sensitive fields
        });
        return users;
    } catch (error) {
        console.error(error);
        throw new Error('Unable to fetch users');
    }
};

const getAllStudents = async () => {
    try {
        const students = await User.findAll({
            where: { role: 'Student' },  // Only fetch users with role "Student"
            attributes: { exclude: ['password', 'otp', 'otpExpiry'] }, // Exclude sensitive fields
        });
        return students;
    } catch (error) {
        console.error(error);
        throw new Error('Unable to fetch students');
    }
};

const getAllTeachers = async () => {
    try {
        const students = await User.findAll({
            where: { role: 'Teacher' },  // Only fetch users with role "Student"
            attributes: { exclude: ['password', 'otp', 'otpExpiry'] }, // Exclude sensitive fields
        });
        return students;
    } catch (error) {
        console.error(error);
        throw new Error('Unable to fetch teachers');
    }
};

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getAllStudents, 
    getAllTeachers // Add the function to exports
};