const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  type: {
    type: String,
    enum: ['mcq', 'fill_in_the_blanks', 'true_false', 'short_answer'],
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    default: [], // Used for MCQ
  },
  correctAnswer: {
    type: String,
    required: true, // Stores the index (for MCQ), "True"/"False" (for T/F), text (for fillups/short answers)
  },
  explanation: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('Question', QuestionSchema);
