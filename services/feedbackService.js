const Feedback = require('../models/feedback');

class FeedbackService {
  // Submit Feedback
  static async submitFeedback(feedbackData) {
    try {
      const feedback = await Feedback.create(feedbackData);
      return feedback;
    } catch (error) {
      throw new Error('Error while submitting feedback: ' + error.message);
    }
  }

  // Get All Feedback (for admin use)
  static async getAllFeedback() {
    try {
      const feedbacks = await Feedback.findAll();
      return feedbacks;
    } catch (error) {
      throw new Error('Error while retrieving feedback: ' + error.message);
    }
  }

  // Get Feedback by User ID (for users to see their feedback)
  static async getFeedbackByUser(userId) {
    try {
      const feedbacks = await Feedback.findAll({ where: { user_id: userId } });
      return feedbacks;
    } catch (error) {
      throw new Error('Error while retrieving user feedback: ' + error.message);
    }
  }
}

module.exports = FeedbackService;
