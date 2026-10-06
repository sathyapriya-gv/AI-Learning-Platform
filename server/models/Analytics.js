const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  totalQuizzesTaken: {
    type: Number,
    default: 0,
  },
  averageScore: {
    type: Number,
    default: 0,
  },
  highestScore: {
    type: Number,
    default: 0,
  },
  weeklyProgress: [{
    week: { type: String, required: true }, // e.g. "Week 27"
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  }],
  monthlyProgress: [{
    month: { type: String, required: true }, // e.g. "Jul 2026"
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  }],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
