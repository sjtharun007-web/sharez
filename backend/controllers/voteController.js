const Vote   = require('../models/Vote');
const Answer = require('../models/Answer');

// @desc    Cast / switch / remove a vote (helpful or not_helpful)
// @route   POST /api/votes
//
// Rules:
//   - One vote per user per answer (helpful OR not_helpful)
//   - helpfulCount and notHelpfulCount are INDEPENDENT — neither affects the other
//   - Clicking same vote again → removes it (toggle off)
//   - Switching vote → removes from old count, adds to new count
//   - Counts never go below 0

const castVote = async (req, res) => {
  try {
    const { answerId, voteType } = req.body;

    if (!answerId || !voteType) {
      return res.status(400).json({ success: false, message: 'answerId and voteType required' });
    }
    if (!['helpful', 'not_helpful'].includes(voteType)) {
      return res.status(400).json({ success: false, message: 'voteType must be helpful or not_helpful' });
    }

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    const existingVote = await Vote.findOne({ userId: req.user._id, answerId });

    if (!existingVote) {
      // ── New vote ──
      await Vote.create({ userId: req.user._id, answerId, voteType });
      if (voteType === 'helpful')     answer.helpfulCount    = Math.max(0, answer.helpfulCount + 1);
      if (voteType === 'not_helpful') answer.notHelpfulCount = Math.max(0, answer.notHelpfulCount + 1);

    } else if (existingVote.voteType === voteType) {
      // ── Same vote → remove (toggle off) ──
      await Vote.deleteOne({ _id: existingVote._id });
      if (voteType === 'helpful')     answer.helpfulCount    = Math.max(0, answer.helpfulCount - 1);
      if (voteType === 'not_helpful') answer.notHelpfulCount = Math.max(0, answer.notHelpfulCount - 1);

    } else {
      // ── Switch vote (helpful ↔ not_helpful) ──
      const oldType = existingVote.voteType;
      existingVote.voteType = voteType;
      await existingVote.save();

      // Remove from old count, add to new count — independently
      if (oldType === 'helpful')     answer.helpfulCount    = Math.max(0, answer.helpfulCount - 1);
      if (oldType === 'not_helpful') answer.notHelpfulCount = Math.max(0, answer.notHelpfulCount - 1);
      if (voteType === 'helpful')    answer.helpfulCount    = Math.max(0, answer.helpfulCount + 1);
      if (voteType === 'not_helpful')answer.notHelpfulCount = Math.max(0, answer.notHelpfulCount + 1);
    }

    await answer.save();

    // Return updated counts + this user's current vote
    const userVote = await Vote.findOne({ userId: req.user._id, answerId });

    res.json({
      success: true,
      data: {
        helpfulCount:    answer.helpfulCount,
        notHelpfulCount: answer.notHelpfulCount,
        userVote:        userVote ? userVote.voteType : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { castVote };
