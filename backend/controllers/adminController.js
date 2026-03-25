const User     = require('../models/User');
const Question = require('../models/Question');
const Answer   = require('../models/Answer');
const Vote     = require('../models/Vote');
const Comment  = require('../models/Comment');

// @desc  Get all students
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// @desc  Get all questions
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: questions.length, data: questions });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// @desc  Delete question + answers + votes + comments
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    const answers = await Answer.find({ questionId: req.params.id });
    const answerIds = answers.map(a => a._id);

    await Vote.deleteMany({ answerId: { $in: answerIds } });
    await Comment.deleteMany({ answerId: { $in: answerIds } });
    await Answer.deleteMany({ questionId: req.params.id });
    await Question.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Question and all related data deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// @desc  Delete answer + its votes + comments
const deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found' });

    await Vote.deleteMany({ answerId: req.params.id });
    await Comment.deleteMany({ answerId: req.params.id });
    await Answer.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Answer deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// @desc  Delete a user + all their data
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete admin' });

    // Delete all their questions cascade
    const questions = await Question.find({ userId: req.params.id });
    for (const q of questions) {
      const answers = await Answer.find({ questionId: q._id });
      const answerIds = answers.map(a => a._id);
      await Vote.deleteMany({ answerId: { $in: answerIds } });
      await Comment.deleteMany({ answerId: { $in: answerIds } });
      await Answer.deleteMany({ questionId: q._id });
    }
    await Question.deleteMany({ userId: req.params.id });

    // Delete their answers + votes + comments on others' questions
    const userAnswers = await Answer.find({ userId: req.params.id });
    const userAnswerIds = userAnswers.map(a => a._id);
    await Vote.deleteMany({ answerId: { $in: userAnswerIds } });
    await Comment.deleteMany({ answerId: { $in: userAnswerIds } });
    await Answer.deleteMany({ userId: req.params.id });

    await Vote.deleteMany({ userId: req.params.id });
    await Comment.deleteMany({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'User and all their data deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { getUsers, getAllQuestions, deleteQuestion, deleteAnswer, deleteUser };
