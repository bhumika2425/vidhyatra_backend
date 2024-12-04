const Blog = require("../models/blog");

const createBlog = async (req, res) => {
  const { blog_title, blog_description } = req.body;
  const files = req.files; // Correct reference to uploaded files

  if (!blog_title || !blog_description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  const serverUrl = 'http://10.0.2.2:3001';
  // Collect URLs of uploaded images
  const imagePaths = files.map(file => `${serverUrl}uploads/blog-images/${file.filename}`);

  try {
    const blog = await Blog.create({ blog_title, blog_description, image_urls: imagePaths, user_id: req.user.user_id });
    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBlogs = async (req, res) => {
    try {
      // Fetch all blogs without pagination
      const blogs = await Blog.findAll();
      res.status(200).json(blogs); // Return all blogs
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

const getBlogById = async (req, res) => {
  try {
    const { blog_id } = req.params;

    // Fetch the blog by ID
    const blog = await Blog.findOne({ where: { blog_id } });

    // Check if the blog exists
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const updateBlog = async (req, res) => {
  const { blog_id } = req.params;
  const { blog_title, blog_description } = req.body;

  try {
    const blog = await Blog.findByPk(blog_id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    blog.blog_title = blog_title || blog.blog_title;
    blog.blog_description = blog_description || blog.blog_description;
    await blog.save();

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBlog = async (req, res) => {
  const { blog_id } = req.params;

  try {
    const blog = await Blog.findByPk(blog_id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await blog.destroy();
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createBlog, getBlogs, updateBlog, deleteBlog , getBlogById };