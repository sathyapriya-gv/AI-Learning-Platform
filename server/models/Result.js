const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  questionTypes: {
    type: [String],
    default: [],
  },
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number,
    required: true, // in seconds
  },
  correctQuestions: {
    type: Number,
    required: true,
  },
  wrongQuestions: {
    type: Number,
    required: true,
  },
  improvementPercentage: {
    type: Number,
    default: 0, // improvement relative to previous quizzes
  },
  weakTopics: {
    type: [String],
    default: [],
  },
  strongTopics: {
    type: [String],
    default: [],
  },
  aiFeedback: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Result', ResultSchema);
