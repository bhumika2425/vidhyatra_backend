const Deadline = require('../models/deadlineModel');


const Profile  = require('../models/profileModel');   // Assuming this is the path to your Profile model

const getAllDeadlines = async (req, res) => {
  try {
    // Step 1: Get the logged-in user's ID from the request (assuming req.user is set by auth middleware)
    const userId = req.user?.user_id; // Adjust this based on your auth setup, e.g., req.user.user_id
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Step 2: Fetch the user's profile to get their year and semester
    const userProfile = await Profile.findOne({ where: { user_id: userId } });
    if (!userProfile) {
      return res.status(404).json({ error: 'Profile not found for this user' });
    }

    const { year, semester } = userProfile;

    // Step 3: Fetch deadlines that match the user's year and semester
    const deadlines = await Deadline.findAll({
      where: {
        year: year || null,      // Handle null case if year is optional
        semester: semester || null // Handle null case if semester is optional
      }
    });

    // Step 4: Return the filtered deadlines
    res.json(deadlines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getDeadlineById = async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id);
    if (!deadline) return res.status(404).json({ message: 'Deadline not found' });
    res.json(deadline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createDeadline = async (req, res) => {
  const { title, course, deadline, year, semester } = req.body;

  try {
    // Check if authenticated entity is an admin
    if ((!req.isAdmin && !req.user?.isAdmin)) {
      return res.status(403).json({ message: 'Only admins can post deadlines.' });
    }

    // Validate required fields
    if (!title || !course || !deadline || !year || !semester) {
      return res.status(400).json({ message: 'Missing required fields (title, course, deadline, year, semester).' });
    }

    // Ensure deadline only contains YYYY-MM-DD
    const formattedDate = new Date(deadline).toISOString().split('T')[0];
    // Check if the deadline date is in the past
    const today = new Date().toISOString().split('T')[0];
    if (formattedDate < today) {
      return res.status(400).json({ message: 'Deadline date cannot be in the past.' });
    }

    // Get the ID of whoever created this (admin or user with admin privileges)
    const created_by = req.isAdmin ? req.admin.admin_id : req.user.user_id;

    // Create the new deadline
    const newDeadline = await Deadline.create({
      title,
      course,
      year,
      semester,
      deadline: formattedDate,
      created_by
    });

    res.status(201).json({ message: 'Deadline created successfully.', deadline: newDeadline });
  } catch (error) {
    res.status(500).json({ message: 'Error creating deadline.', error: error.message });
  }
};

const updateDeadline = async (req, res) => {
  const { title, course,year,semester, deadline, isCompleted } = req.body;
  try {
    const existingDeadline = await Deadline.findById(req.params.id);
    if (!existingDeadline) return res.status(404).json({ message: 'Deadline not found' });
    await existingDeadline.update({ title, course,year,semester, deadline, isCompleted });
    res.json({ message: 'Deadline updated', deadline: existingDeadline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markDeadlineCompleted = async (req, res) => {
  const { isCompleted } = req.body;
  if (isCompleted === undefined) {
    return res.status(400).json({ message: 'isCompleted field is required' });
  }
  try {
    const deadline = await Deadline.findById(req.params.id);
    if (!deadline) return res.status(404).json({ message: 'Deadline not found' });
    await deadline.update({ isCompleted });
    res.json({ message: 'Completion status updated', deadline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteDeadline = async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id);
    if (!deadline) return res.status(404).json({ message: 'Deadline not found' });
    await deadline.destroy();
    res.json({ message: 'Deadline deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllDeadlinesAdmin = async (req, res) => {
  try {
    // Only admin should access this route (additional check)
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Only admins can view all deadlines.' });
    }

    // Fetch all deadlines without any filters
    const deadlines = await Deadline.findAll({
      order: [
        ['deadline', 'ASC'], // Order by deadline date ascending
        ['createdAt', 'DESC'] // Then by creation date descending
      ]
    });

    res.status(200).json(deadlines);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching deadlines.', error: error.message });
  }
};

// Export controller functions (assuming authentication middleware will be added later)
module.exports = {
  getAllDeadlines,
  getAllDeadlinesAdmin,
  getDeadlineById,
  createDeadline,
  updateDeadline,
  markDeadlineCompleted,
  deleteDeadline,
};