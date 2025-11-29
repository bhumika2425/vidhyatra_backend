const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const notificationRoutes = require('../routes/notificationRoutes');
const notificationController = require('../controllers/notificationController');
const { authenticateUser } = require('../middleware/auth');

// Mock dependencies
jest.mock('../controllers/notificationController');
jest.mock('../middleware/auth');

describe('Notification API Routes', () => {
  let app;
  let testUser;
  let testToken;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware
    authenticateUser.mockImplementation((req, res, next) => {
      req.user = testUser;
      next();
    });
    
    app.use('/api/notifications', notificationRoutes);

    // Create test user and token
    testUser = {
      user_id: 1,
      email: 'test@example.com',
      role: 'Student'
    };
    
    testToken = jwt.sign(
      { user_id: testUser.user_id, role: testUser.role },
      process.env.JWT_SECRET || 'test-secret'
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/notifications/my-notifications', () => {
    test('should get user notifications successfully', async () => {
      const mockNotifications = {
        notifications: [
          {
            notification_id: 1,
            title: 'Test Notification',
            message: 'Test message',
            type: 'SYSTEM_ANNOUNCEMENT',
            priority: 'MEDIUM',
            is_read: false,
            created_at: new Date()
          }
        ],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false
      };

      notificationController.getUserNotifications.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Notifications retrieved successfully',
          data: mockNotifications
        });
      });

      const response = await request(app)
        .get('/api/notifications/my-notifications')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications).toHaveLength(1);
      expect(notificationController.getUserNotifications).toHaveBeenCalled();
    });

    test('should handle pagination parameters', async () => {
      notificationController.getUserNotifications.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Notifications retrieved successfully',
          data: { notifications: [], totalCount: 0 }
        });
      });

      await request(app)
        .get('/api/notifications/my-notifications?page=2&limit=10')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(notificationController.getUserNotifications).toHaveBeenCalled();
    });

    test('should require authentication', async () => {
      authenticateUser.mockImplementationOnce((req, res) => {
        res.status(401).json({ message: 'Unauthorized' });
      });

      await request(app)
        .get('/api/notifications/my-notifications')
        .expect(401);
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    test('should get unread count successfully', async () => {
      notificationController.getUnreadCount.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Unread count retrieved successfully',
          data: { unreadCount: 5 }
        });
      });

      const response = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.unreadCount).toBe(5);
    });
  });

  describe('PATCH /api/notifications/mark-read/:id', () => {
    test('should mark notification as read successfully', async () => {
      notificationController.markAsRead.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Notification marked as read'
        });
      });

      await request(app)
        .patch('/api/notifications/mark-read/1')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(notificationController.markAsRead).toHaveBeenCalled();
    });

    test('should handle invalid notification ID', async () => {
      notificationController.markAsRead.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      });

      await request(app)
        .patch('/api/notifications/mark-read/999')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/notifications/mark-all-read', () => {
    test('should mark all notifications as read successfully', async () => {
      notificationController.markAllAsRead.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'All notifications marked as read'
        });
      });

      await request(app)
        .patch('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(notificationController.markAllAsRead).toHaveBeenCalled();
    });
  });

  describe('POST /api/notifications/send-to-user', () => {
    test('should send notification to user with valid data', async () => {
      notificationController.sendToUser.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: 'Notification sent successfully'
        });
      });

      const notificationData = {
        userId: 2,
        title: 'Test Notification',
        message: 'Test message',
        type: 'SYSTEM_ANNOUNCEMENT',
        priority: 'HIGH'
      };

      await request(app)
        .post('/api/notifications/send-to-user')
        .set('Authorization', `Bearer ${testToken}`)
        .send(notificationData)
        .expect(201);

      expect(notificationController.sendToUser).toHaveBeenCalled();
    });

    test('should validate required fields', async () => {
      const invalidData = {
        userId: 2,
        title: '', // Empty title should fail validation
        message: 'Test message',
        type: 'SYSTEM_ANNOUNCEMENT'
      };

      await request(app)
        .post('/api/notifications/send-to-user')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData)
        .expect(400);
    });

    test('should validate notification type', async () => {
      const invalidData = {
        userId: 2,
        title: 'Test',
        message: 'Test message',
        type: 'INVALID_TYPE' // Invalid type should fail validation
      };

      await request(app)
        .post('/api/notifications/send-to-user')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /api/notifications/send-to-multiple', () => {
    test('should send notification to multiple users', async () => {
      notificationController.sendToMultipleUsers.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: 'Notification sent to 3 users',
          data: { count: 3 }
        });
      });

      const notificationData = {
        userIds: [1, 2, 3],
        title: 'Bulk Notification',
        message: 'This is sent to multiple users',
        type: 'SYSTEM_ANNOUNCEMENT'
      };

      await request(app)
        .post('/api/notifications/send-to-multiple')
        .set('Authorization', `Bearer ${testToken}`)
        .send(notificationData)
        .expect(201);

      expect(notificationController.sendToMultipleUsers).toHaveBeenCalled();
    });

    test('should validate userIds array', async () => {
      const invalidData = {
        userIds: [], // Empty array should fail validation
        title: 'Test',
        message: 'Test message',
        type: 'SYSTEM_ANNOUNCEMENT'
      };

      await request(app)
        .post('/api/notifications/send-to-multiple')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /api/notifications/send-to-role', () => {
    test('should send notification to role', async () => {
      notificationController.sendToRole.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: 'Notification sent to all users with role: Student',
          data: { count: 5 }
        });
      });

      const notificationData = {
        role: 'Student',
        title: 'Student Announcement',
        message: 'This is for all students',
        type: 'ACADEMIC_UPDATE'
      };

      await request(app)
        .post('/api/notifications/send-to-role')
        .set('Authorization', `Bearer ${testToken}`)
        .send(notificationData)
        .expect(201);

      expect(notificationController.sendToRole).toHaveBeenCalled();
    });

    test('should validate role', async () => {
      const invalidData = {
        role: 'InvalidRole', // Invalid role should fail validation
        title: 'Test',
        message: 'Test message',
        type: 'SYSTEM_ANNOUNCEMENT'
      };

      await request(app)
        .post('/api/notifications/send-to-role')
        .set('Authorization', `Bearer ${testToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /api/notifications/broadcast', () => {
    test('should broadcast notification to all users', async () => {
      notificationController.broadcastToAll.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: 'Notification broadcasted to all users',
          data: { count: 100 }
        });
      });

      const notificationData = {
        title: 'Important Announcement',
        message: 'This is sent to everyone',
        type: 'SYSTEM_ANNOUNCEMENT',
        priority: 'URGENT'
      };

      await request(app)
        .post('/api/notifications/broadcast')
        .set('Authorization', `Bearer ${testToken}`)
        .send(notificationData)
        .expect(201);

      expect(notificationController.broadcastToAll).toHaveBeenCalled();
    });
  });

  describe('POST /api/notifications/test', () => {
    test('should send test notification', async () => {
      notificationController.testNotification.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: 'Test notification sent successfully'
        });
      });

      await request(app)
        .post('/api/notifications/test')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(notificationController.testNotification).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle controller errors gracefully', async () => {
      notificationController.getUserNotifications.mockImplementation((req, res) => {
        res.status(500).json({
          success: false,
          message: 'Internal server error'
        });
      });

      await request(app)
        .get('/api/notifications/my-notifications')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(500);
    });
  });
});
