const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Vote = require('../models/Vote');

// @desc    Add answer to a question
// @route   POST /api/answers
const addAnswer = async (req, res) => {
  try {
    const { questionId, content } = req.body;
    if (!questionId || !content) {
      return res.status(400).json({ success: false, message: 'questionId and content required' });
    }
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    const answer = await Answer.create({ questionId, content, userId: req.user._id });
    await answer.populate('userId', 'name email');
    res.status(201).json({ success: true, data: { ...answer.toObject(), userVote: null } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all answers for a question with user's vote status
// @route   GET /api/answers/:questionId
const getAnswers = async (req, res) => {
  try {
    const answers = await Answer.find({ questionId: req.params.questionId })
      .populate('userId', 'name email')
      .sort({ helpfulCount: -1, createdAt: -1 });

    // Attach current user's vote to each answer
    let userVotes = {};
    if (req.user) {
      const answerIds = answers.map(a => a._id);
      const votes = await Vote.find({ userId: req.user._id, answerId: { $in: answerIds } });
      votes.forEach(v => { userVotes[v.answerId.toString()] = v.voteType; });
    }

    const enriched = answers.map(a => ({
      ...a.toObject(),
      userVote: userVotes[a._id.toString()] || null
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addAnswer, getAnswers };
