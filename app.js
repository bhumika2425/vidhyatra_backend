const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profile');
const blogRoutes = require('./routes/blogRoutes');
const friendRequestRoutes = require('./routes/friendRequestRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const eventRoutes = require('./routes/eventRoutes');
const feeRoutes = require('./routes/feeRoutes');
const esewaRoutes = require("./routes/esewaRoutes");
const routineRoutes = require("./routes/routineRoutes"); 

const http = require('http'); // HTTP module for server
require('dotenv').config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const cors = require("cors");

app.use(bodyParser.json());

app.use(cors({
    origin: "*", // Allow all origins (for testing)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/friendRequest', friendRequestRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/eventCalender', eventRoutes);
app.use('/api/collegeFees', feeRoutes);
app.use("/api/payFees", esewaRoutes);
app.use('/api/routines', routineRoutes); 


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/test.html");
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