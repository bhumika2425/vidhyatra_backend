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

    // Process feedbacks to include username while respecting anonymity
    const sanitizedFeedbacks = feedbacks.map((feedback) => {
      const feedbackData = feedback.toJSON();
      if (feedbackData.is_anonymous) {
        // For anonymous feedback, remove user info
        delete feedbackData.user_id;
        delete feedbackData.user;
        feedbackData.username = 'Anonymous';
      } else {
        // For non-anonymous feedback, include username
        feedbackData.username = feedbackData.user?.name || 'Unknown User';
        delete feedbackData.user; // Remove the nested user object
      }
      return feedbackData;
    });

    return res.status(200).json({ feedbacks: sanitizedFeedbacks });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve feedback', error: error.message });
  }
};

// Get Feedback by User (for users to view their feedback)
const getFeedbackByUser = async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const feedbacks = await FeedbackService.getFeedbackByUser(user_id);
    
    // Process feedbacks to include username
    const processedFeedbacks = feedbacks.map((feedback) => {
      const feedbackData = feedback.toJSON();
      if (feedbackData.is_anonymous) {
        feedbackData.username = 'Anonymous';
      } else {
        feedbackData.username = feedbackData.user?.name || 'Unknown User';
      }
      delete feedbackData.user; // Remove the nested user object
      return feedbackData;
    });

    return res.status(200).json({ feedbacks: processedFeedbacks });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve user feedback', error: error.message });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackByUser,
};
