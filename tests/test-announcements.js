// Test script for Announcement API
// Run this after starting the server: node tests/test-announcements.js

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001/api/announcements';
let adminToken = ''; // Replace with actual admin token
let userId = ''; // Replace with actual user token
let createdAnnouncementId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Test 1: Create Announcement
async function testCreateAnnouncement() {
  try {
    log('\n🧪 Test 1: Create Announcement', 'blue');
    
    const response = await axios.post(
      BASE_URL,
      {
        title: 'Test Announcement',
        description: 'This is a test announcement created via API',
        button_text: 'Got it',
        is_paused: false,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    createdAnnouncementId = response.data.data.announcement_id;
    log('✅ Announcement created successfully', 'green');
    log(`ID: ${createdAnnouncementId}`, 'yellow');
    console.log(response.data);
  } catch (error) {
    log('❌ Failed to create announcement', 'red');
    console.error(error.response?.data || error.message);
  }
}

// Test 2: Get All Announcements (Admin)
async function testGetAllAnnouncements() {
  try {
    log('\n🧪 Test 2: Get All Announcements', 'blue');
    
    const response = await axios.get(`${BASE_URL}?include_paused=true`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    log(`✅ Retrieved ${response.data.count} announcements`, 'green');
    console.log(response.data);
  } catch (error) {
    log('❌ Failed to get announcements', 'red');
    console.error(error.response?.data || error.message);
  }
}

// Test 3: Get Announcement by ID
async function testGetAnnouncementById() {
  try {
    log('\n🧪 Test 3: Get Announcement by ID', 'blue');
    
    const response = await axios.get(`${BASE_URL}/${createdAnnouncementId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    log('✅ Retrieved announcement', 'green');
    console.log(response.data);
  } catch (error) {
    log('❌ Failed to get announcement', 'red');
    console.error(error.response?.data || error.message);
  }
}

// Test 4: Update Announcement
async function testUpdateAnnouncement() {
  try {
    log('\n🧪 Test 4: Update Announcement', 'blue');
    
    const response = await axios.put(
      `${BASE_URL}/${createdAnnouncementId}`,
      {
        title: 'Updated Test Announcement',
        description: 'This announcement has been updated',
        button_text: 'Understood',
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    log('✅ Announcement updated successfully', 'green');
    console.log(response.data);
  } catch (error) {
    log('❌ Failed to update announcement', 'red');
    console.error(error.response?.data || error.message);
  }
}

// Test 5: Toggle Pause
async function testTogglePause() {
  try {
    log('\n🧪 Test 5: Toggle Pause Status', 'blue');
    
    const response = await axios.patch(
      `${BASE_URL}/${createdAnnouncementId}/toggle-pause`,
      {},
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    log('✅ Pause status toggled', 'green');
    console.log(response.data);
  } catch (error) {
    log('❌ Failed to toggle pause', 'red');
    console.error(error.response?.data || error.message);
  }
}

// Test 6: Get Active Announcements (Student)
async function testGetActiveAnnouncements() {
  try {
    log('\n🧪 Test 6: Get Active Announcements (Student)', 'blue');
    
    const response = await axios.get(`${BASE_URL}/active/list`, {
      headers: {
        Authorization: `Bearer ${userId}`,
      },
    });

    log(`✅ Retrieved ${response.data.count} active announcements`, 'green');
    console.log(response.data);
  } catch (error) {
    log('❌ Failed to get active announcements', 'red');
    console.error(error.response?.data || error.message);
  }
}

// Test 7: Get Statistics
async function testGetStats() {
  try {
    log('\n🧪 Test 7: Get Announcement Statistics', 'blue');
    
    const response = await axios.get(`${BASE_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    log('✅ Retrieved statistics', 'green');
    console.log(response.data);
  } catch (error) {
    log('❌ Failed to get statistics', 'red');
    console.error(error.response?.data || error.message);
  }
}

// Test 8: Delete Announcement
async function testDeleteAnnouncement() {
  try {
    log('\n🧪 Test 8: Delete Announcement', 'blue');
    
    const response = await axios.delete(`${BASE_URL}/${createdAnnouncementId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    log('✅ Announcement deleted successfully', 'green');
    console.log(response.data);
  } catch (error) {
    log('❌ Failed to delete announcement', 'red');
    console.error(error.response?.data || error.message);
  }
}

// Run all tests
async function runAllTests() {
  log('\n🚀 Starting Announcement API Tests...', 'blue');
  log('=' .repeat(50), 'blue');

  if (!adminToken) {
    log('\n⚠️  Please set adminToken and userId in the script!', 'yellow');
    log('You need to login as admin and user first to get tokens.', 'yellow');
    return;
  }

  await testCreateAnnouncement();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testGetAllAnnouncements();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testGetAnnouncementById();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testUpdateAnnouncement();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testTogglePause();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testGetActiveAnnouncements();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testGetStats();
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testDeleteAnnouncement();

  log('\n' + '='.repeat(50), 'blue');
  log('✨ All tests completed!', 'green');
}

// Execute tests
runAllTests().catch(error => {
  log('\n💥 Test suite failed', 'red');
  console.error(error);
});
