const Question = require('../models/Question');
const Answer   = require('../models/Answer');

// @desc    Create a question
// @route   POST /api/questions
const createQuestion = async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    // Clean and limit tags
    const cleanTags = Array.isArray(tags)
      ? tags.map(t => t.toLowerCase().trim()).filter(Boolean).slice(0, 5)
      : [];

    const question = await Question.create({
      title, description, tags: cleanTags, userId: req.user._id
    });

    await question.populate('userId', 'name email');
    res.status(201).json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all questions with filters (tag, solved, search)
// @route   GET /api/questions?tag=dsa&solved=false&search=pointer
const getQuestions = async (req, res) => {
  try {
    const { tag, solved, search } = req.query;

    // MongoDB Aggregation: count answers per question + filter support
    const matchStage = {};

    if (tag)    matchStage.tags = tag.toLowerCase();
    if (solved !== undefined) matchStage.isSolved = solved === 'true';
    if (search) matchStage.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const questions = await Question.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'answers', localField: '_id',
          foreignField: 'questionId', as: 'answers'
        }
      },
      {
        $lookup: {
          from: 'users', localField: 'userId',
          foreignField: '_id', as: 'author'
        }
      },
      {
        $addFields: {
          answerCount: { $size: '$answers' },
          author: { $arrayElemAt: ['$author', 0] }
        }
      },
      {
        $project: {
          title: 1, description: 1, tags: 1,
          isSolved: 1, solvedAnswerId: 1,
          userId: 1, answerCount: 1, createdAt: 1,
          'author.name': 1, 'author.email': 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('userId', 'name email');
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all unique tags
// @route   GET /api/questions/tags/all
const getAllTags = async (req, res) => {
  try {
    const tags = await Question.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ]);
    res.json({ success: true, data: tags });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark an answer as the solution
// @route   PATCH /api/questions/:id/solve
const markSolved = async (req, res) => {
  try {
    const { answerId } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    if (question.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the question author can mark it as solved' });
    }

    // Toggle off if same answer clicked again
    if (question.solvedAnswerId?.toString() === answerId) {
      question.isSolved       = false;
      question.solvedAnswerId = null;
    } else {
      question.isSolved       = true;
      question.solvedAnswerId = answerId;
    }

    await question.save();
    res.json({ success: true, data: { isSolved: question.isSolved, solvedAnswerId: question.solvedAnswerId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createQuestion, getQuestions, getQuestion, getAllTags, markSolved };

// @desc    Get current user's questions
// @route   GET /api/questions/my
const getMyQuestions = async (req, res) => {
  try {
    const questions = await Question.aggregate([
      { $match: { userId: req.user._id } },
      {
        $lookup: {
          from: 'answers', localField: '_id',
          foreignField: 'questionId', as: 'answers'
        }
      },
      {
        $addFields: { answerCount: { $size: '$answers' } }
      },
      {
        $project: {
          title: 1, description: 1, tags: 1,
          isSolved: 1, answerCount: 1, createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.json({ success: true, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
module.exports = { createQuestion, getQuestions, getQuestion, getAllTags, markSolved, getMyQuestions };
