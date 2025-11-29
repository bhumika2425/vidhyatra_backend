const request = require('supertest');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const notificationService = require('../services/notificationService');
const Notification = require('../models/notification');
const User = require('../models/user');

// Mock the database models
jest.mock('../models/notification');
jest.mock('../models/user');
jest.mock('../services/notificationService');

describe('Socket.IO Notification System', () => {
  let app, server, io, clientSocket;
  let testUser, testToken;

  beforeAll((done) => {
    // Setup Express app with Socket.IO
    app = express();
    server = http.createServer(app);
    io = socketIo(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Setup authentication middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
        socket.userId = decoded.user_id;
        socket.userRole = decoded.role || 'Student';
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    // Setup Socket.IO connection handler
    io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      socket.join(`user_${socket.userId}`);
      socket.join(`role_${socket.userRole.toLowerCase()}`);

      socket.on('user_online', () => {
        socket.broadcast.emit('user_status', {
          userId: socket.userId,
          status: 'online'
        });
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
      });
    });

    // Initialize notification service
    notificationService.setSocketIO(io);

    server.listen(() => {
      const port = server.address().port;
      
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

      done();
    });
  });

  afterAll((done) => {
    server.close();
    done();
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Socket.IO Connection', () => {
    test('should authenticate user with valid token', (done) => {
      const Client = require('socket.io-client');
      clientSocket = Client(`http://localhost:${server.address().port}`, {
        auth: { token: testToken }
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        clientSocket.disconnect();
        done();
      });

      clientSocket.on('connect_error', (error) => {
        done(error);
      });
    });

    test('should reject connection with invalid token', (done) => {
      const Client = require('socket.io-client');
      const invalidSocket = Client(`http://localhost:${server.address().port}`, {
        auth: { token: 'invalid-token' }
      });

      invalidSocket.on('connect_error', (error) => {
        expect(error.message).toBe('Authentication error');
        done();
      });

      invalidSocket.on('connect', () => {
        done(new Error('Should not connect with invalid token'));
      });
    });

    test('should reject connection without token', (done) => {
      const Client = require('socket.io-client');
      const noTokenSocket = Client(`http://localhost:${server.address().port}`);

      noTokenSocket.on('connect_error', (error) => {
        expect(error.message).toBe('Authentication error');
        done();
      });

      noTokenSocket.on('connect', () => {
        done(new Error('Should not connect without token'));
      });
    });
  });

  describe('Notification Service', () => {
    beforeEach(() => {
      // Mock Notification.create
      Notification.create.mockResolvedValue({
        notification_id: 1,
        user_id: testUser.user_id,
        title: 'Test Notification',
        message: 'Test message',
        type: 'SYSTEM_ANNOUNCEMENT',
        priority: 'MEDIUM',
        is_read: false,
        created_at: new Date()
      });

      // Mock User.findAll
      User.findAll.mockResolvedValue([
        { user_id: 1 },
        { user_id: 2 },
        { user_id: 3 }
      ]);
    });

    test('should send notification to specific user', async () => {
      const notificationData = {
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'SYSTEM_ANNOUNCEMENT',
        priority: 'HIGH'
      };

      const result = await notificationService.sendToUser(testUser.user_id, notificationData);

      expect(Notification.create).toHaveBeenCalledWith({
        user_id: testUser.user_id,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        priority: notificationData.priority,
        data: null,
        expires_at: null
      });

      expect(result).toBeDefined();
      expect(result.title).toBe(notificationData.title);
    });

    test('should send notification to multiple users', async () => {
      const userIds = [1, 2, 3];
      const notificationData = {
        title: 'Bulk Notification',
        message: 'This is sent to multiple users',
        type: 'SYSTEM_ANNOUNCEMENT'
      };

      const results = await notificationService.sendToMultipleUsers(userIds, notificationData);

      expect(Notification.create).toHaveBeenCalledTimes(3);
      expect(results).toHaveLength(3);
    });

    test('should send notification to role', async () => {
      const notificationData = {
        title: 'Role Notification',
        message: 'This is sent to all students',
        type: 'ACADEMIC_UPDATE'
      };

      const results = await notificationService.sendToRole('Student', notificationData);

      expect(User.findAll).toHaveBeenCalledWith({
        where: { role: 'Student' },
        attributes: ['user_id']
      });
      expect(Notification.create).toHaveBeenCalledTimes(3);
    });

    test('should broadcast to all users', async () => {
      const notificationData = {
        title: 'Broadcast Notification',
        message: 'This is sent to everyone',
        type: 'SYSTEM_ANNOUNCEMENT'
      };

      const results = await notificationService.broadcastToAll(notificationData);

      expect(User.findAll).toHaveBeenCalledWith({ attributes: ['user_id'] });
      expect(Notification.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('Real-time Notification Delivery', () => {
    let clientSocket;

    beforeEach((done) => {
      const Client = require('socket.io-client');
      clientSocket = Client(`http://localhost:${server.address().port}`, {
        auth: { token: testToken }
      });

      clientSocket.on('connect', () => {
        done();
      });
    });

    afterEach(() => {
      if (clientSocket.connected) {
        clientSocket.disconnect();
      }
    });

    test('should receive real-time notification', (done) => {
      const notificationData = {
        title: 'Real-time Test',
        message: 'This should arrive in real-time',
        type: 'SYSTEM_ANNOUNCEMENT',
        priority: 'HIGH'
      };

      clientSocket.on('notification', (data) => {
        expect(data.title).toBe(notificationData.title);
        expect(data.message).toBe(notificationData.message);
        expect(data.type).toBe(notificationData.type);
        expect(data.priority).toBe(notificationData.priority);
        expect(data.isRead).toBe(false);
        done();
      });

      // Send notification after setting up listener
      setTimeout(() => {
        notificationService.sendToUser(testUser.user_id, notificationData);
      }, 100);
    });

    test('should emit user status updates', (done) => {
      clientSocket.on('user_status', (data) => {
        expect(data.userId).toBe(testUser.user_id);
        expect(data.status).toBe('online');
        done();
      });

      // Emit user online status
      clientSocket.emit('user_online');
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      Notification.create.mockRejectedValue(new Error('Database error'));

      await expect(
        notificationService.sendToUser(testUser.user_id, {
          title: 'Test',
          message: 'Test',
          type: 'SYSTEM_ANNOUNCEMENT'
        })
      ).rejects.toThrow('Database error');
    });

    test('should handle invalid notification data', async () => {
      await expect(
        notificationService.sendToUser(null, {
          title: '',
          message: '',
          type: 'INVALID_TYPE'
        })
      ).rejects.toThrow();
    });
  });

  describe('Performance Tests', () => {
    test('should handle multiple concurrent connections', (done) => {
      const Client = require('socket.io-client');
      const connections = [];
      const numConnections = 10;
      let connectedCount = 0;

      for (let i = 0; i < numConnections; i++) {
        const socket = Client(`http://localhost:${server.address().port}`, {
          auth: { token: testToken }
        });

        socket.on('connect', () => {
          connectedCount++;
          if (connectedCount === numConnections) {
            // All connections established
            connections.forEach(s => s.disconnect());
            done();
          }
        });

        connections.push(socket);
      }
    });

    test('should handle rapid notification sending', async () => {
      const promises = [];
      const numNotifications = 100;

      for (let i = 0; i < numNotifications; i++) {
        promises.push(
          notificationService.sendToUser(testUser.user_id, {
            title: `Notification ${i}`,
            message: `Message ${i}`,
            type: 'SYSTEM_ANNOUNCEMENT'
          })
        );
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(numNotifications);
      expect(Notification.create).toHaveBeenCalledTimes(numNotifications);
    });
  });

  describe('Cleanup and Memory Management', () => {
    test('should clean up old notifications', async () => {
      const mockDestroy = jest.fn().mockResolvedValue(5);
      Notification.destroy = mockDestroy;

      const deletedCount = await notificationService.cleanupOldNotifications(30);

      expect(mockDestroy).toHaveBeenCalled();
      expect(deletedCount).toBe(5);
    });
  });
});
