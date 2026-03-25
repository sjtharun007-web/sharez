const express = require('express');
const router  = express.Router();
const { getUsers, getAllQuestions, deleteQuestion, deleteAnswer, deleteUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);

router.get('/users',            getUsers);
router.delete('/users/:id',     deleteUser);
router.get('/questions',        getAllQuestions);
router.delete('/questions/:id', deleteQuestion);
router.delete('/answers/:id',   deleteAnswer);

module.exports = router;
