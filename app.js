const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profile');
const messagingRoutes = require('./routes/messaging.js'); // Import messaging routes
const blogRoutes = require('./routes/blogRoutes');
const friendRequestRoutes = require('./routes/friendRequestRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const path = require('path'); 
const {profileImageUpload, chatFileUpload} = require('./config/multerConfig'); // Multer configuration imported here
const http = require('http'); // HTTP module for server
const { Server } = require('socket.io'); // Socket.IO server for real-time communication
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server); // Initialize Socket.IO

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/messages', messagingRoutes); // Add messaging routes
app.use('/api/blog', blogRoutes);
app.use('/api/friendRequest', friendRequestRoutes);
app.use('/api/feedback', feedbackRoutes);

// Route for handling profile image upload
app.post('/uploads/profile-image', profileImageUpload.single('profileImage'), (req, res) => {
    if (req.file) {
        // If a file was uploaded
        return res.json({ profileImageUrl: `/uploads/profile-images/${req.file.filename}` });
    }
    // If no file was uploaded, return a success response without the image URL
    return res.json({ message: 'No image uploaded', profileImageUrl: null });
});

// Set static folder for serving uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Real-time messaging feature
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for a "sendMessage" event
    socket.on('sendMessage', (data) => {
        console.log('Message received:', data);

        // Broadcast the message to the receiver
        io.to(data.receiverId).emit('receiveMessage', data);
    });

    // Join a room for private messaging
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Sync Sequelize models and start the server
const { sequelizeVidhyatra } = require('./config/db');
sequelizeVidhyatra.sync()
    .then(() => {
        server.listen(3001, () => { // Start the server using `server` for Socket.IO
            console.log('Server running on port 3001');
        });
    })
    .catch(err => console.error(err));
