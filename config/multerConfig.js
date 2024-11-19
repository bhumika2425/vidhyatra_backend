// config/multer.js

const multer = require('multer');
const path = require('path');

// Multer configuration for file uploads (profile image)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile-images'); // Directory to save the profile images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: file size limit (5MB here)
  fileFilter: (req, file, cb) => {
    // Allowed file extensions and MIME types
    const allowedExtensions = ['.jpeg', '.jpg', '.png'];
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/octet-stream'];

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileMimeType = file.mimetype.toLowerCase();

    // Log file details for debugging
    console.log(`File extension: ${fileExtension}`);
    console.log(`File MIME type: ${fileMimeType}`);

    // Check if the file is an image based on either MIME type or extension
    if (allowedExtensions.includes(fileExtension) && allowedMimeTypes.includes(fileMimeType)) {
      cb(null, true);
    } else {
      const errorMsg = `Only images are allowed (jpeg, jpg, png). Received: ${fileMimeType}`;
      console.error(errorMsg);
      cb(new Error(errorMsg));
    }
  }
});

module.exports = upload;