const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Answer content is required'],
    trim: true,
    minlength: 5,
    maxlength: 3000
  },
  helpfulCount:    { type: Number, default: 0 },
  notHelpfulCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);
