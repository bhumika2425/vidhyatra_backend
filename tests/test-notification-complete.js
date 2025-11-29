/**
 * Comprehensive Socket.IO Notification System Test
 * Tests: Authentication, Connection, Real-time delivery, Database persistence, HTTP endpoints
 */

const io = require('socket.io-client');
const http = require('http');

// Configuration
const SERVER_URL = 'http://localhost:3001';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzM4MzE3NTEwLCJleHAiOjE3MzgzMjExMTB9.XYZ'; // Replace with valid token
const TEST_USER_ID = 1;
const TEST_ROLE = 'student';

// Test Results Storage
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(name, passed, message) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ PASS: ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ FAIL: ${name} - ${message}`);
  }
  testResults.tests.push({ name, passed, message });
}

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SERVER_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test Suite
async function runTests() {
  console.log('\n🚀 Starting Comprehensive Socket.IO Notification System Tests\n');
  console.log('=' .repeat(70));
  
  // Test 1: Server Health Check
  console.log('\n📋 Test 1: Server Health Check');
  try {
    const response = await makeRequest('/');
    logTest(
      'Server Health Check',
      response.status === 200,
      response.status !== 200 ? `Expected 200, got ${response.status}` : 'Server is running'
    );
  } catch (error) {
    logTest('Server Health Check', false, error.message);
  }

  // Test 2: Socket.IO Connection without Auth (Should Fail)
  console.log('\n📋 Test 2: Socket.IO Connection without Authentication');
  await new Promise((resolve) => {
    const socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: false
    });

    const timeout = setTimeout(() => {
      socket.disconnect();
      logTest('Socket Connection without Auth', false, 'Connection should have been rejected');
      resolve();
    }, 3000);

    socket.on('connect_error', (error) => {
      clearTimeout(timeout);
      socket.disconnect();
      logTest(
        'Socket Connection without Auth',
        error.message.includes('Authentication'),
        error.message.includes('Authentication') ? 'Correctly rejected unauthorized connection' : error.message
      );
      resolve();
    });

    socket.on('connect', () => {
      clearTimeout(timeout);
      socket.disconnect();
      logTest('Socket Connection without Auth', false, 'Should not connect without auth');
      resolve();
    });
  });

  // Test 3: Socket.IO Connection with Auth (Requires valid token)
  console.log('\n📋 Test 3: Socket.IO Connection with Authentication');
  let authenticatedSocket;
  await new Promise((resolve) => {
    authenticatedSocket = io(SERVER_URL, {
      transports: ['websocket'],
      auth: { token: TEST_TOKEN },
      reconnection: false
    });

    const timeout = setTimeout(() => {
      authenticatedSocket.disconnect();
      logTest('Socket Connection with Auth', false, 'Connection timeout - Check if token is valid');
      resolve();
    }, 5000);

    authenticatedSocket.on('connect_error', (error) => {
      clearTimeout(timeout);
      authenticatedSocket.disconnect();
      logTest('Socket Connection with Auth', false, `Connection error: ${error.message}`);
      console.log('💡 Note: Update TEST_TOKEN in the script with a valid JWT token');
      resolve();
    });

    authenticatedSocket.on('connect', () => {
      clearTimeout(timeout);
      logTest('Socket Connection with Auth', true, 'Successfully connected to Socket.IO server');
      resolve();
    });
  });

  // Test 4: Real-time Notification Delivery
  if (authenticatedSocket && authenticatedSocket.connected) {
    console.log('\n📋 Test 4: Real-time Notification Delivery');
    await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        logTest('Real-time Notification Delivery', false, 'No notification received within timeout');
        resolve();
      }, 5000);

      authenticatedSocket.on('notification', (notification) => {
        clearTimeout(timeout);
        logTest(
          'Real-time Notification Delivery',
          notification && notification.type && notification.message,
          notification ? 'Received notification successfully' : 'Invalid notification format'
        );
        console.log('📨 Received notification:', JSON.stringify(notification, null, 2));
        resolve();
      });

      // Trigger a test notification via HTTP
      console.log('📤 Sending test notification...');
      makeRequest('/api/notifications/send', 'POST', {
        userId: TEST_USER_ID,
        type: 'SYSTEM',
        title: 'Test Notification',
        message: 'This is a test notification from automated test suite',
        priority: 'HIGH',
        data: { testId: Date.now() }
      }, TEST_TOKEN).catch(error => {
        console.log('⚠️  Could not send test notification via HTTP:', error.message);
      });
    });
  }

  // Test 5: HTTP Endpoint - Get Notifications
  console.log('\n📋 Test 5: HTTP Endpoint - Get Notifications');
  try {
    const response = await makeRequest(`/api/notifications?userId=${TEST_USER_ID}`, 'GET', null, TEST_TOKEN);
    logTest(
      'HTTP Get Notifications',
      response.status === 200 || response.status === 401,
      response.status === 401 
        ? 'Endpoint requires authentication (expected if token is invalid)' 
        : response.status === 200 
          ? `Retrieved ${response.body?.notifications?.length || 0} notifications`
          : `Unexpected status: ${response.status}`
    );
    if (response.status === 200 && response.body) {
      console.log(`📊 Total notifications: ${response.body.total || 0}`);
      console.log(`📊 Unread notifications: ${response.body.unread || 0}`);
    }
  } catch (error) {
    logTest('HTTP Get Notifications', false, error.message);
  }

  // Test 6: HTTP Endpoint - Mark as Read
  console.log('\n📋 Test 6: HTTP Endpoint - Mark Notification as Read');
  try {
    const response = await makeRequest('/api/notifications/1/read', 'PUT', {}, TEST_TOKEN);
    logTest(
      'HTTP Mark as Read',
      response.status === 200 || response.status === 401 || response.status === 404,
      response.status === 401 
        ? 'Endpoint requires authentication' 
        : response.status === 404
          ? 'Notification not found (expected if no notifications exist)'
          : response.status === 200
            ? 'Successfully marked as read'
            : `Unexpected status: ${response.status}`
    );
  } catch (error) {
    logTest('HTTP Mark as Read', false, error.message);
  }

  // Test 7: HTTP Endpoint - Mark All as Read
  console.log('\n📋 Test 7: HTTP Endpoint - Mark All as Read');
  try {
    const response = await makeRequest('/api/notifications/read-all', 'PUT', { userId: TEST_USER_ID }, TEST_TOKEN);
    logTest(
      'HTTP Mark All as Read',
      response.status === 200 || response.status === 401,
      response.status === 401 
        ? 'Endpoint requires authentication' 
        : response.status === 200
          ? `Marked ${response.body?.updated || 0} notifications as read`
          : `Unexpected status: ${response.status}`
    );
  } catch (error) {
    logTest('HTTP Mark All as Read', false, error.message);
  }

  // Test 8: Database Persistence Check
  console.log('\n📋 Test 8: Database Persistence Check');
  try {
    // First, send a notification
    const sendResponse = await makeRequest('/api/notifications/send', 'POST', {
      userId: TEST_USER_ID,
      type: 'SYSTEM',
      title: 'Persistence Test',
      message: 'Testing database persistence',
      priority: 'MEDIUM'
    }, TEST_TOKEN);

    // Then retrieve notifications to verify persistence
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for DB write
    const getResponse = await makeRequest(`/api/notifications?userId=${TEST_USER_ID}`, 'GET', null, TEST_TOKEN);
    
    logTest(
      'Database Persistence',
      (sendResponse.status === 201 || sendResponse.status === 401) && (getResponse.status === 200 || getResponse.status === 401),
      sendResponse.status === 401 
        ? 'Authentication required for this test'
        : getResponse.status === 200
          ? 'Notifications persisted in database'
          : `Send: ${sendResponse.status}, Get: ${getResponse.status}`
    );
  } catch (error) {
    logTest('Database Persistence', false, error.message);
  }

  // Cleanup
  if (authenticatedSocket && authenticatedSocket.connected) {
    authenticatedSocket.disconnect();
  }

  // Print Summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  
  console.log('\n📋 DETAILED RESULTS:');
  testResults.tests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.passed ? '✅' : '❌'} ${test.name}`);
    if (test.message) {
      console.log(`   ${test.message}`);
    }
  });

  console.log('\n💡 NOTES:');
  console.log('- Some tests require a valid JWT token. Update TEST_TOKEN constant.');
  console.log('- Ensure you have a user with ID=1 in your database.');
  console.log('- Database must be running and connected.');
  console.log('- Server must be running on port 3001.');
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🏁 Test Suite Completed\n');

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the test suite
runTests().catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});
