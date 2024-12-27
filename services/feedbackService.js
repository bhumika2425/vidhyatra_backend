const crypto = require('crypto');
const Feedback = require('../models/feedback');

// Utility to hash user_id
const hashUserId = (userId) => {
  const salt = crypto.randomBytes(16).toString('hex'); // Generate a random salt
  const userIdString = userId.toString(); // Convert user_id to a string
  const hash = crypto.createHmac('sha256', salt).update(userIdString).digest('hex');
  return `${salt}:${hash}`; // Store salt and hash together
};

// Submit Feedback
const submitFeedback = async (feedbackData) => {
  try {
    const { user_id, is_anonymous } = feedbackData;

    // Hash user_id if feedback is anonymous
    if (is_anonymous) {
      feedbackData.user_id = hashUserId(user_id);
    }

    const feedback = await Feedback.create(feedbackData);
    return feedback;
  } catch (error) {
    throw new Error('Error while submitting feedback: ' + error.message);
  }
};

// Get All Feedback (for admin use)
const getAllFeedback = async () => {
  try {
    const feedbacks = await Feedback.findAll();
    return feedbacks;
  } catch (error) {
    throw new Error('Error while retrieving feedback: ' + error.message);
  }
};

// Get Feedback by User ID (for users to see their feedback)
const getFeedbackByUser = async (userId) => {
  try {
    const feedbacks = await Feedback.findAll({ where: { user_id: userId } });
    return feedbacks;
  } catch (error) {
    throw new Error('Error while retrieving user feedback: ' + error.message);
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackByUser,
};
