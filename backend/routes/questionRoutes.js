const express = require('express');
const router  = express.Router();
const {
  createQuestion, getQuestions, getQuestion,
  getAllTags, markSolved, getMyQuestions
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/tags/all',    getAllTags);
router.get('/my',          protect, getMyQuestions);
router.get('/',            getQuestions);
router.get('/:id',         getQuestion);
router.post('/',           protect, createQuestion);
router.patch('/:id/solve', protect, markSolved);

module.exports = router;
