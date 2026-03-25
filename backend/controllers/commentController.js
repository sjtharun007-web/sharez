const Comment = require('../models/Comment');
const Answer  = require('../models/Answer');

// @desc    Add comment to an answer
// @route   POST /api/comments
const addComment = async (req, res) => {
  try {
    const { answerId, content } = req.body;

    if (!answerId || !content?.trim()) {
      return res.status(400).json({ success: false, message: 'answerId and content are required' });
    }

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    const comment = await Comment.create({
      answerId,
      content: content.trim(),
      userId: req.user._id
    });

    await comment.populate('userId', 'name');

    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all comments for an answer
// @route   GET /api/comments/:answerId
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ answerId: req.params.answerId })
      .populate('userId', 'name')
      .sort({ createdAt: 1 });

    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a comment (owner only)
// @route   DELETE /api/comments/:id
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addComment, getComments, deleteComment };
