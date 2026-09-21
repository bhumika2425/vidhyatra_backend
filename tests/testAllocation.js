/**
 * Test script for seat allocation functionality
 * 
 * Prerequisites:
 * 1. Backend server should be running
 * 2. Valid JWT token for an admin user
 * 3. Exam ID 4 exists in database
 * 4. Classroom ID 10 exists in database
 * 5. Students exist in icp_students database
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Replace this with your actual JWT token
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo1LCJyb2xlIjoiVGVhY2hlciIsImlzQWRtaW4iOnRydWUsImlhdCI6MTc2NTc2OTYxMiwiZXhwIjoxNzY1ODU2MDEyfQ.neFSVJ0S1aKSMmnGJRV6bvPh8vq3lQSVP1CHbKMl5us';

// Test configuration
const EXAM_ID = 4;
const CLASSROOM_IDS = [10];
const STRATEGIES = ['random_mixed', 'section_separated', 'roll_number'];

/**
 * Make API request using native http/https
 */
function makeRequest(endpoint, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, BASE_URL);
        const protocol = url.protocol === 'https:' ? https : http;
        
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${JWT_TOKEN}`
            }
        };
        
        if (body) {
            const bodyString = JSON.stringify(body);
            options.headers['Content-Length'] = Buffer.byteLength(bodyString);
        }
        
        const req = protocol.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        ok: false,
                        error: 'Invalid JSON response',
                        rawData: data
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            resolve({
                status: 0,
                ok: false,
                error: error.message
            });
        });
        
        if (body) {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

/**
 * Test 1: Get exam details
 */
async function testGetExam() {
    console.log('\n📋 TEST 1: Get Exam Details');
    console.log('='.repeat(50));
    
    const result = await makeRequest(`/api/exams/${EXAM_ID}`);
    
    if (result.ok) {
        console.log('✅ Success! Exam details retrieved');
        console.log('Exam:', result.data.exam.subject);
        console.log('Faculty:', result.data.exam.faculty);
        console.log('Year:', result.data.exam.year);
        console.log('Semester:', result.data.exam.semester);
        console.log('Total Students:', result.data.exam.total_students);
        return true;
    } else {
        console.log('❌ Failed:', result.data.error || 'Unknown error');
        return false;
    }
}

/**
 * Test 2: Delete existing allocations
 */
async function testDeleteAllocations() {
    console.log('\n🗑️  TEST 2: Delete Existing Allocations');
    console.log('='.repeat(50));
    
    const result = await makeRequest(`/api/exams/${EXAM_ID}/allocations`, 'DELETE');
    
    if (result.ok) {
        console.log('✅ Success! Allocations deleted');
        return true;
    } else {
        console.log('⚠️  Warning:', result.data.error || 'No allocations to delete');
        return true; // Continue even if no allocations exist
    }
}

/**
 * Test 3: Generate allocation with each strategy
 */
async function testGenerateAllocation(strategy) {
    console.log(`\n🎲 TEST 3: Generate Allocation (${strategy})`);
    console.log('='.repeat(50));
    
    const result = await makeRequest(
        `/api/exams/${EXAM_ID}/allocate`,
        'POST',
        {
            classroomIds: CLASSROOM_IDS,
            strategy: strategy
        }
    );
    
    if (result.ok) {
        console.log('✅ Success! Allocation generated');
        console.log('Strategy:', result.data.summary.strategy);
        console.log('Total Allocated:', result.data.summary.total_allocated);
        console.log('Classrooms Used:', result.data.summary.classrooms_used);
        console.log('\nSample allocations (first 3):');
        result.data.allocations.slice(0, 3).forEach(alloc => {
            console.log(`  - ${alloc.college_id} (${alloc.student_name}): Classroom ${alloc.classroom.classroom_name}, Seat ${alloc.seat_number}, Row ${alloc.row_number}, Col ${alloc.column_number}`);
        });
        return result.data;
    } else {
        console.log('❌ Failed:', result.data.error || 'Unknown error');
        return null;
    }
}

/**
 * Test 4: Get allocations
 */
async function testGetAllocations() {
    console.log('\n📊 TEST 4: Get Allocations');
    console.log('='.repeat(50));
    
    const result = await makeRequest(`/api/exams/${EXAM_ID}/allocations`);
    
    if (result.ok) {
        console.log('✅ Success! Allocations retrieved');
        console.log('Total Allocations:', result.data.total);
        console.log('Grouped by Classrooms:', Object.keys(result.data.allocations).length);
        
        Object.entries(result.data.allocations).forEach(([classroomName, allocations]) => {
            console.log(`\n  ${classroomName}: ${allocations.length} students`);
        });
        
        return result.data;
    } else {
        console.log('❌ Failed:', result.data.error || 'Unknown error');
        return null;
    }
}

/**
 * Test 5: Swap two seats
 */
async function testSwapSeats(allocationData) {
    console.log('\n🔄 TEST 5: Swap Two Seats');
    console.log('='.repeat(50));
    
    if (!allocationData || allocationData.allocations.length < 2) {
        console.log('⚠️  Skipping: Not enough allocations to swap');
        return true;
    }
    
    const allocation1 = allocationData.allocations[0];
    const allocation2 = allocationData.allocations[1];
    
    console.log(`Swapping:`);
    console.log(`  Student 1: ${allocation1.college_id} at Seat ${allocation1.seat_number}`);
    console.log(`  Student 2: ${allocation2.college_id} at Seat ${allocation2.seat_number}`);
    
    const result = await makeRequest(
        `/api/allocations/swap`,
        'POST',
        {
            allocation1Id: allocation1.id,
            allocation2Id: allocation2.id
        }
    );
    
    if (result.ok) {
        console.log('✅ Success! Seats swapped');
        console.log(`  ${result.data.swap.student1} ↔ ${result.data.swap.student2}`);
        return true;
    } else {
        console.log('❌ Failed:', result.data.error || 'Unknown error');
        return false;
    }
}

/**
 * Test 6: Update single allocation
 */
async function testUpdateAllocation(allocationData) {
    console.log('\n✏️  TEST 6: Update Single Allocation');
    console.log('='.repeat(50));
    
    if (!allocationData || allocationData.allocations.length === 0) {
        console.log('⚠️  Skipping: No allocations to update');
        return true;
    }
    
    const allocation = allocationData.allocations[0];
    const newSeatNumber = allocation.seat_number + 100; // Move to a different seat
    
    console.log(`Updating:`);
    console.log(`  Student: ${allocation.college_id}`);
    console.log(`  Old Seat: ${allocation.seat_number}`);
    console.log(`  New Seat: ${newSeatNumber}`);
    
    const result = await makeRequest(
        `/api/allocations/${allocation.id}`,
        'PUT',
        {
            seat_number: newSeatNumber,
            row_number: Math.ceil(newSeatNumber / allocation.classroom.columns),
            column_number: ((newSeatNumber - 1) % allocation.classroom.columns) + 1
        }
    );
    
    if (result.ok) {
        console.log('✅ Success! Allocation updated');
        return true;
    } else {
        console.log('❌ Failed:', result.data.error || 'Unknown error');
        return false;
    }
}

/**
 * Test 7: Verify data in icp_students database
 */
async function testStudentsExist() {
    console.log('\n👥 TEST 7: Verify Students in Database');
    console.log('='.repeat(50));
    
    const { sequelizeIcpStudents } = require('../config/db');
    
    try {
        const [students] = await sequelizeIcpStudents.query(`
            SELECT COUNT(*) as count, department, year, semester
            FROM students
            WHERE department = 'BIT' AND year = '2nd'
            GROUP BY department, year, semester
        `);
        
        console.log('✅ Students found in icp_students database:');
        students.forEach(row => {
            console.log(`  ${row.department} - Year ${row.year}, Semester ${row.semester}: ${row.count} students`);
        });
        
        return true;
    } catch (error) {
        console.log('❌ Failed:', error.message);
        return false;
    }
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('\n🚀 SEAT ALLOCATION TESTING SUITE');
    console.log('='.repeat(50));
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Exam ID: ${EXAM_ID}`);
    console.log(`Classrooms: ${CLASSROOM_IDS.join(', ')}`);
    
    let allocationData = null;
    
    // Test 0: Verify students exist
    await testStudentsExist();
    
    // Test 1: Get exam details
    const examTest = await testGetExam();
    if (!examTest) {
        console.log('\n❌ Cannot proceed without exam data');
        return;
    }
    
    // Test 2: Delete existing allocations
    await testDeleteAllocations();
    
    // Test 3: Generate allocation (testing first strategy only for now)
    allocationData = await testGenerateAllocation(STRATEGIES[0]);
    if (!allocationData) {
        console.log('\n❌ Cannot proceed without allocation data');
        return;
    }
    
    // Test 4: Get allocations
    const getAllocResult = await testGetAllocations();
    
    // Test 5: Swap seats
    await testSwapSeats(allocationData);
    
    // Test 6: Update allocation
    await testUpdateAllocation(allocationData);
    
    // Test 4 again: Verify changes
    console.log('\n🔍 Verifying changes...');
    await testGetAllocations();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL TESTS COMPLETED!');
    console.log('='.repeat(50));
}

// Run tests
runAllTests().then(() => {
    console.log('\n👋 Test suite finished');
    process.exit(0);
}).catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
});
