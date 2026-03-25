const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: 10,
    maxlength: 2000
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: (tags) => tags.length <= 5,
      message: 'Maximum 5 tags allowed'
    }
  },
  isSolved: {
    type: Boolean,
    default: false
  },
  solvedAnswerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
