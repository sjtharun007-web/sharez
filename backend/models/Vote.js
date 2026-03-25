const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    required: true
  },
  voteType: {
    type: String,
    enum: ['helpful', 'not_helpful'],
    required: true
  }
}, { timestamps: true });

// One vote per user per answer
voteSchema.index({ userId: 1, answerId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
