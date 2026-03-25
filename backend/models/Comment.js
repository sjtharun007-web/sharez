const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  answerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment cannot be empty'],
    trim: true,
    minlength: 1,
    maxlength: 500
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
