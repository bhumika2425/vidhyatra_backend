#!/bin/bash

echo "🧪 Testing Announcement API Endpoints"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3001"

# Check if server is running
echo "📡 Checking if backend server is running..."
if curl -s "${BASE_URL}" > /dev/null; then
    echo -e "${GREEN}✅ Backend server is running${NC}"
else
    echo -e "${RED}❌ Backend server is not running on ${BASE_URL}${NC}"
    echo "Please start the server with: cd vidhyatra_backend && npm start"
    exit 1
fi

echo ""
echo "⚠️  Note: You need to provide a valid admin JWT token to test these endpoints"
echo "Please replace YOUR_ADMIN_TOKEN_HERE in the script with an actual token"
echo ""

# Replace this with your actual admin token
ADMIN_TOKEN="YOUR_ADMIN_TOKEN_HERE"

if [ "$ADMIN_TOKEN" = "YOUR_ADMIN_TOKEN_HERE" ]; then
    echo -e "${YELLOW}⚠️  Using placeholder token - requests will fail without valid token${NC}"
    echo "Get your token by:"
    echo "1. Login as admin through the admin panel"
    echo "2. Open browser console: localStorage.getItem('adminToken')"
    echo "3. Copy the token and replace in this script"
    echo ""
fi

# Test 1: Get Stats
echo "1️⃣  Testing GET /api/announcements/stats"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  "${BASE_URL}/api/announcements/stats")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Success (200)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Failed (${HTTP_STATUS})${NC}"
    echo "$BODY"
fi
echo ""

# Test 2: Get All Announcements
echo "2️⃣  Testing GET /api/announcements"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  "${BASE_URL}/api/announcements")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Success (200)${NC}"
    COUNT=$(echo "$BODY" | grep -o '"count":[0-9]*' | cut -d: -f2)
    echo "Total announcements: ${COUNT:-0}"
else
    echo -e "${RED}❌ Failed (${HTTP_STATUS})${NC}"
    echo "$BODY"
fi
echo ""

# Test 3: Create Announcement (without image)
echo "3️⃣  Testing POST /api/announcements (Create)"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Announcement",
    "description": "This is a test announcement created by the test script",
    "button_text": "Got it",
    "is_paused": false
  }' \
  "${BASE_URL}/api/announcements")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_STATUS" = "201" ]; then
    echo -e "${GREEN}✅ Success (201)${NC}"
    ANNOUNCEMENT_ID=$(echo "$BODY" | grep -o '"announcement_id":[0-9]*' | cut -d: -f2)
    echo "Created announcement ID: ${ANNOUNCEMENT_ID}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Failed (${HTTP_STATUS})${NC}"
    echo "$BODY"
fi
echo ""

echo "======================================"
echo "✅ Test script completed"
echo ""
echo "📝 To test with Postman:"
echo "1. Import the collection from ANNOUNCEMENT_API.md"
echo "2. Set your admin token in the Authorization header"
echo "3. Test all endpoints including image uploads"
echo ""
echo "📱 To test Flutter app:"
echo "1. Create announcements from admin panel"
echo "2. Login to Flutter app as student"
echo "3. Announcements should appear after dashboard loads"
