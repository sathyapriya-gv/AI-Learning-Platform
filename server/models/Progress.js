const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  quizHistory: [{
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    result: { type: mongoose.Schema.Types.ObjectId, ref: 'Result' },
    percentage: { type: Number, required: true },
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  }],
  averageScore: {
    type: Number,
    default: 0,
  },
  highestScore: {
    type: Number,
    default: 0,
  },
  improvementPercentage: {
    type: Number,
    default: 0, // overall improvement percentage for this topic (e.g. latest - first quiz)
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Progress', ProgressSchema);
