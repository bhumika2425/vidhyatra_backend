const LostAndFound = require("../models/lostAndFoundModel");
const Profile = require("../models/profileModel");

// Create a new lost or found post
const createLostAndFound = async (req, res) => {
  try {
    console.log('Incoming request body:', req.body);
    console.log('req.user from middleware:', req.user);

    const { item_type, description, status, location } = req.body;
    const user_id = req.user?.user_id;

    if (!user_id) {
      console.log('Authentication failure: No user_id found in req.user');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!item_type || !description || !status) {
      return res.status(400).json({ error: 'Item type, description, and status are required' });
    }

    if (!['lost', 'found'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either "lost" or "found"' });
    }

    console.log('req.files:', req.files);
    let image_urls = [];
    if (req.files && req.files.length > 0) {
      image_urls = req.files.map(file => file.path);
      console.log('Generated image_urls:', image_urls);
    }

    const newPost = await LostAndFound.create({
      item_type,
      description,
      status,
      location,
      user_id,
      image_urls,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('New lost and found post created:', newPost.toJSON());
    return res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating lost and found post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all lost and found posts
const getLostAndFoundPosts = async (req, res) => {
  try {
    const posts = await LostAndFound.findAll({
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['profileImageUrl', 'full_name'],
        },
      ],
    });

    const formattedPosts = posts.map(post => ({
      id: post.id,
      item_type: post.item_type,
      description: post.description,
      status: post.status,
      location: post.location,
      image_urls: post.image_urls,
      user_id: post.user_id,
      createdAt: post.createdAt,
      profileImageUrl: post.profile ? post.profile.profileImageUrl : null,
      full_name: post.profile ? post.profile.full_name : 'Unknown',
    }));

    res.status(200).json({ posts: formattedPosts });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific lost and found post by ID
const getLostAndFoundById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await LostAndFound.findOne({
      where: { id },
      include: [
        {
          model: Profile,
          as: 'profile',
          attributes: ['profileImageUrl', 'full_name'],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const formattedPost = {
      id: post.id,
      item_type: post.item_type,
      description: post.description,
      status: post.status,
      location: post.location,
      image_urls: post.image_urls,
      user_id: post.user_id,
      createdAt: post.createdAt,
      profileImageUrl: post.profile ? post.profile.profileImageUrl : null,
      full_name: post.profile ? post.profile.full_name : 'Unknown',
    };

    res.status(200).json(formattedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a lost and found post
const updateLostAndFound = async (req, res) => {
  const { id } = req.params;
  const { item_type, description, status, location } = req.body;

  try {
    const post = await LostAndFound.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let image_urls = post.image_urls;
    if (req.files && req.files.length > 0) {
      image_urls = req.files.map(file => file.path);
    }

    post.item_type = item_type || post.item_type;
    post.description = description || post.description;
    post.status = status || post.status;
    post.location = location || post.location;
    post.image_urls = image_urls;
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a lost and found post
const deleteLostAndFound = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await LostAndFound.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await post.destroy();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createLostAndFound,
  getLostAndFoundPosts,
  getLostAndFoundById,
  updateLostAndFound,
  deleteLostAndFound,
};