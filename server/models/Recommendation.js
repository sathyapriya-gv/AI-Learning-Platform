const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weakTopics: [{
    topic: { type: String, required: true },
    averageScore: { type: Number, required: true },
    reason: { type: String },
  }],
  strongTopics: [{
    topic: { type: String, required: true },
    averageScore: { type: Number, required: true },
  }],
  suggestions: {
    type: [String],
    default: [],
  },
  recommendedStudyTime: {
    type: Number,
    default: 30, // in minutes
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Recommendation', RecommendationSchema);
