// routes/blogRoutes.js
const express = require("express");
const blogController = require("../controller/blogController");
const authenticateUser = require("../middleware/auth");
const router = express.Router();
const { blogImageUpload } = require("../config/multerConfig"); // Adjust path if needed

router.post("/post", authenticateUser,blogImageUpload,  blogController.createBlog);

router.get("/all", authenticateUser, blogController.getBlogs);

router.put("/:blog_id", authenticateUser, blogImageUpload, blogController.updateBlog);

router.delete("/:blog_id", authenticateUser, blogController.deleteBlog);

// Fetch a specific blog by ID
router.get('/:blog_id', authenticateUser, blogController.getBlogById);

router.post("/:blog_id/like", authenticateUser, blogController.likeBlog);
router.post("/:blog_id/comment", authenticateUser, blogController.commentOnBlog);


module.exports = router;