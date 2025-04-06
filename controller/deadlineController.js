const Deadline = require('../models/deadlineModel');

// Controller functions
const getAllDeadlines = async (req, res) => {
  try {
    const deadlines = await Deadline.findAll();
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
  const { title, course, deadline } = req.body;

  try {
    // Check if user is admin (requires JWT middleware)
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admins can post deadlines.' });
    }

    // Validate required fields
    if (!title || !course || !deadline) {
      return res.status(400).json({ message: 'Missing required fields (title, course, deadline).' });
    }

    // Ensure deadline only contains YYYY-MM-DD
    const formattedDate = new Date(deadline).toISOString().split('T')[0];
    // Check if the deadline date is in the past
    const today = new Date().toISOString().split('T')[0];
    if (formattedDate < today) {
      return res.status(400).json({ message: 'Deadline date cannot be in the past.' });
    }

    // Create the new deadline
    const newDeadline = await Deadline.create({
      title,
      course,
      deadline: formattedDate,
      created_by: req.user.user_id, // Link to the admin who created it
    });

    res.status(201).json({ message: 'Deadline created successfully.', deadline: newDeadline });
  } catch (error) {
    res.status(500).json({ message: 'Error creating deadline.', error: error.message });
  }
};

const updateDeadline = async (req, res) => {
  const { title, course, deadline, isCompleted } = req.body;
  try {
    const existingDeadline = await Deadline.findById(req.params.id);
    if (!existingDeadline) return res.status(404).json({ message: 'Deadline not found' });
    await existingDeadline.update({ title, course, deadline, isCompleted });
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

// Export controller functions (assuming authentication middleware will be added later)
module.exports = {
  getAllDeadlines,
  getDeadlineById,
  createDeadline,
  updateDeadline,
  markDeadlineCompleted,
  deleteDeadline,
};