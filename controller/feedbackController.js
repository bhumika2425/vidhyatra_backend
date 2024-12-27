const FeedbackService = require('../services/feedbackService');

// Submit Feedback (POST request)
const submitFeedback = async (req, res) => {
  try {
    const { feedback_type, feedback_content, is_anonymous } = req.body;
    const user_id = req.user.user_id; // Extract user_id from the authenticated user

    if (!feedback_type || !feedback_content) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    const feedbackData = {
      user_id,
      feedback_type,
      feedback_content,
      is_anonymous,
    };

    const feedback = await FeedbackService.submitFeedback(feedbackData);
    
    // Remove `user_id` from response if feedback is anonymous
    if (is_anonymous) {
      delete feedback.dataValues.user_id;
    }

    return res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
  }
};

// Get All Feedback (for admin)
const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await FeedbackService.getAllFeedback();

    // Hide `user_id` for feedbacks marked as anonymous
    const sanitizedFeedbacks = feedbacks.map((feedback) => {
      if (feedback.is_anonymous) {
        const { user_id, ...rest } = feedback.dataValues;
        return rest;
      }
      return feedback;
    });

    return res.status(200).json({ feedbacks: sanitizedFeedbacks });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve feedback', error: error.message });
  }
};

// Get Feedback by User (for users to view their feedback)
const getFeedbackByUser = async (req, res) => {
  const user_id = req.user.user_id; // Extract user_id from the authenticated user
  try {
    const feedbacks = await FeedbackService.getFeedbackByUser(user_id);
    return res.status(200).json({ feedbacks });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve user feedback', error: error.message });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackByUser,
};
