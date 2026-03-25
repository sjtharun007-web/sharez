const express = require('express');
const router = express.Router();
const { addAnswer, getAnswers } = require('../controllers/answerController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:questionId', protect, getAnswers);
router.post('/', protect, addAnswer);

module.exports = router;
