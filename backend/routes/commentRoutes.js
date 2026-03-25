const express = require('express');
const router  = express.Router();
const { addComment, getComments, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:answerId',  protect, getComments);
router.post('/',          protect, addComment);
router.delete('/:id',     protect, deleteComment);

module.exports = router;
