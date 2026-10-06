const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, quizController.generateQuiz);
router.post('/submit', protect, quizController.submitQuiz);

module.exports = router;
