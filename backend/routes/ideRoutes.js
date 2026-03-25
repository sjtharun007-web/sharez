const express = require('express');
const router = express.Router();
const { runCode } = require('../controllers/ideController');
const { protect } = require('../middleware/authMiddleware');

// protect keeps it login-only but won't cause redirect issues
router.post('/run', protect, runCode);

module.exports = router;
