// multerConfig.js
const multer = require('multer');
const path = require('path');
const cloudinary = require('./cloudinaryConfig'); // Import from separate file
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// File size limit (5MB)
const fileSizeLimit = 5 * 1024 * 1024;

// Storage configuration for profile images
const profileImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile-images',
    allowed_formats: ['jpeg', 'jpg', 'png'],
    public_id: (req, file) => `${Date.now()}-${path.parse(file.originalname).name}`,
  },
});

// Storage configuration for chat files
const chatFileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat-files',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'pdf', 'docx', 'zip'],
    public_id: (req, file) => `${Date.now()}-${path.parse(file.originalname).name}`,
  },
});

// Storage configuration for blog images
const blogImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog-images',
    allowed_formats: ['jpeg', 'jpg', 'png'],
    public_id: (req, file) => `${Date.now()}-${path.parse(file.originalname).name}`,
  },
});

// Storage configuration for lost and found item images
const lostAndFoundImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lost-and-found-images',
    allowed_formats: ['jpeg', 'jpg', 'png'],
    public_id: (req, file) => `${Date.now()}-${path.parse(file.originalname).name}`,
  },
});

// File filter for profile images
const profileImageFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpeg', '.jpg', '.png'];
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/octet-stream'];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const fileMimeType = file.mimetype.toLowerCase();

  console.log(`File extension: ${fileExtension}`);
  console.log(`File MIME type: ${fileMimeType}`);

  if (allowedExtensions.includes(fileExtension) && allowedMimeTypes.includes(fileMimeType)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'));
  }
};

// File filter for chat files
const chatFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.pdf', '.docx', '.zip'];
  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/pdf', 'application/msword', 'application/zip'
  ];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const fileMimeType = file.mimetype.toLowerCase();

  if (allowedExtensions.includes(fileExtension) && allowedMimeTypes.includes(fileMimeType)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type.'));
  }
};

// Multer instance for profile image upload
const profileImageUpload = multer({
  storage: profileImageStorage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: profileImageFilter
});

// Multer instance for chat file upload
const chatFileUpload = multer({
  storage: chatFileStorage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: chatFileFilter
});

// Multer instance for blog image upload
const blogImageUpload = multer({
  storage: blogImageStorage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: profileImageFilter
}).array('images', 10);

// Multer instance for lost and found image upload
const lostAndFoundImageUpload = multer({
  storage: lostAndFoundImageStorage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: profileImageFilter
}).array('images', 5); // Allow up to 5 images per post

module.exports = {
  profileImageUpload,
  chatFileUpload,
  blogImageUpload,
  lostAndFoundImageUpload
};