const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profile');
const path = require('path'); // Add this line
const upload = require('./config/multerConfig'); // Multer configuration imported here
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);


// Route for handling profile image upload
app.post('/uploads/profile-image', upload.single('profileImage'), (req, res) => {
    if (req.file) {
      // If a file was uploaded
      return res.json({ profileImageUrl: `/uploads/profile-images/${req.file.filename}` });
    }
    // If no file was uploaded, return a success response without the image URL
    return res.json({ message: 'No image uploaded', profileImageUrl: null });
  });

// Set static folder for serving uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Sync Sequelize models and start the server
const { sequelizeVidhyatra } = require('./config/db');
sequelizeVidhyatra.sync()
    .then(() => {
        app.listen(3001, () => {
            console.log('Server running on port 3001');
        });
    })
    .catch(err => console.error(err));