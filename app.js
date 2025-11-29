const express = require('express');
const bodyParser = require('body-parser');
const adminLoginRoutes = require('./routes/adminLoginRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profile');
const blogRoutes = require('./routes/blogRoutes');
const friendRequestRoutes = require('./routes/friendRequestRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const eventRoutes = require('./routes/eventRoutes');
const feeRoutes = require('./routes/feeRoutes');
const esewaRoutes = require("./routes/esewaRoutes");
const routineRoutes = require("./routes/routineRoutes"); 
const deadlineRoutes = require('./routes/deadlineRoutes');
const timeSlotRoutes = require('./routes/timeSlotRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const academicRoutes = require('./routes/academicRoutes');
const lostAndFoundRoutes = require('./routes/lostAndFoundRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize notification cleanup cron job
require('./jobs/notificationCleanup');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
});

const cors = require("cors");

app.use(bodyParser.json());

app.use(cors({
    origin: "*", // Allow all origins (for testing)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/friendRequest', friendRequestRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/eventCalender', eventRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/collegeFees', feeRoutes);
app.use("/api/payFees", esewaRoutes);
app.use('/api/routines', routineRoutes); 
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/adminLoginRoutes', adminLoginRoutes);
app.use('/api/timeslots', timeSlotRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/lost-and-found', lostAndFoundRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);

// Socket.IO Authentication Middleware
io.use((socket, next) => {
    console.log(`🔑 Socket.IO Auth - Authenticating new connection`);
    const token = socket.handshake.auth.token;
    console.log(`🔍 Socket.IO Auth - Token received: ${token ? token.substring(0, 20) + '...' : 'null'}`);
    
    if (!token) {
        console.log(`❌ Socket.IO Auth - No token provided`);
        return next(new Error('Authentication error: No token provided'));
    }

    try {
        console.log(`🔓 Socket.IO Auth - Verifying JWT token`);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`✅ Socket.IO Auth - Token decoded successfully`);
        console.log(`👤 Socket.IO Auth - User ID: ${decoded.user_id}, Role: ${decoded.role || 'Student'}`);
        socket.userId = decoded.user_id;
        socket.userRole = decoded.role || 'Student';
        console.log(`✅ Socket.IO Auth - Authentication successful for user ${decoded.user_id}`);
        next();
    } catch (err) {
        console.log(`❌ Socket.IO Auth - Token verification failed: ${err.message}`);
        next(new Error('Authentication error: Invalid token'));
    }
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
    console.log(`✅ Socket.IO - User ${socket.userId} (${socket.userRole}) connected successfully`);
    console.log(`🔍 Socket.IO - Socket ID: ${socket.id}`);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    console.log(`🏠 Socket.IO - User ${socket.userId} joined room: user_${socket.userId}`);
    
    // Join role-based rooms
    socket.join(`role_${socket.userRole.toLowerCase()}`);
    console.log(`👥 Socket.IO - User ${socket.userId} joined role room: role_${socket.userRole.toLowerCase()}`);
    
    // Handle user going online
    socket.on('user_online', () => {
        console.log(`🟢 Socket.IO - User ${socket.userId} is now online`);
        socket.broadcast.emit('user_status', {
            userId: socket.userId,
            status: 'online'
        });
        console.log(`📤 Socket.IO - Broadcasted online status for user ${socket.userId}`);
    });
    
    // Handle user typing indicators for chat features
    socket.on('typing', (data) => {
        console.log(`✍️ Socket.IO - User ${socket.userId} is typing in chat ${data.chatId} to user ${data.recipientId}`);
        socket.to(`user_${data.recipientId}`).emit('user_typing', {
            userId: socket.userId,
            chatId: data.chatId
        });
    });
    
    socket.on('stop_typing', (data) => {
        console.log(`✋ Socket.IO - User ${socket.userId} stopped typing in chat ${data.chatId} to user ${data.recipientId}`);
        socket.to(`user_${data.recipientId}`).emit('user_stopped_typing', {
            userId: socket.userId,
            chatId: data.chatId
        });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`❌ Socket.IO - User ${socket.userId} disconnected`);
        console.log(`🔍 Socket.IO - Disconnect reason: ${socket.disconnected}`);
        socket.broadcast.emit('user_status', {
            userId: socket.userId,
            status: 'offline'
        });
        console.log(`📤 Socket.IO - Broadcasted offline status for user ${socket.userId}`);
    });
});

// Make io available globally for other modules
global.io = io;
console.log(`🌐 Socket.IO - IO instance made globally available`);

// Initialize notification service with Socket.IO
const notificationService = require('./services/notificationService');
notificationService.setSocketIO(io);
console.log(`🔔 NotificationService - Initialized with Socket.IO`);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/test.html");
});

const { sequelizeVidhyatra, createDatabaseIfNotExists } = require('./config/db');

const startServer = async () => {
    try {
        // Create database if it doesn't exist
        await createDatabaseIfNotExists();
        
        // Sync Sequelize models
        await sequelizeVidhyatra.sync();
        
        // Start the server
        server.listen(3001, '0.0.0.0', () => { // Listen on all interfaces
            console.log('Server running on http://0.0.0.0:3001');
            console.log('Accessible from Android emulator at http://10.0.2.2:3001');
            console.log('Accessible from local machine at http://localhost:3001');
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();