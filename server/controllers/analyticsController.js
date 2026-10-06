const Result = require('../models/Result');
const Progress = require('../models/Progress');
const Analytics = require('../models/Analytics');
const Recommendation = require('../models/Recommendation');
const File = require('../models/File');
const User = require('../models/User');

/**
 * Fetch main dashboard analytics
 * @route GET /api/analytics/dashboard
 */
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Fetch user analytics summary
    let analytics = await Analytics.findOne({ user: userId });
    if (!analytics) {
      analytics = {
        totalQuizzesTaken: 0,
        averageScore: 0,
        highestScore: 0,
        weeklyProgress: [],
        monthlyProgress: [],
      };
    }

    // 2. Fetch weak/strong topics from progress
    const progresses = await Progress.find({ user: userId });
    const weakTopics = progresses
      .filter((p) => p.averageScore < 60)
      .map((p) => ({ topic: p.topic, average: p.averageScore }));
    const strongTopics = progresses
      .filter((p) => p.averageScore >= 75)
      .map((p) => ({ topic: p.topic, average: p.averageScore }));

    // 3. Get recent quizzes (limit 5)
    const recentQuizzes = await Result.find({ user: userId })
      .populate('quiz', 'difficulty questionTypes')
      .sort({ date: -1 })
      .limit(5);

    // 4. Calculate overall improvement (compare average of last 3 quizzes vs first 3 quizzes, or similar)
    const allResults = await Result.find({ user: userId }).sort({ date: 1 });
    let improvementPercentage = 0;
    
    if (allResults.length > 1) {
      const firstQuizScore = allResults[0].percentage;
      const latestQuizScore = allResults[allResults.length - 1].percentage;
      improvementPercentage = parseFloat((latestQuizScore - firstQuizScore).toFixed(1));
    }

    // 5. Fetch recommendations
    const recommendation = await Recommendation.findOne({ user: userId });

    res.json({
      totalQuizzesTaken: analytics.totalQuizzesTaken,
      averageScore: analytics.averageScore,
      highestScore: analytics.highestScore,
      improvementPercentage,
      weakTopics,
      strongTopics,
      recentQuizzes,
      weeklyProgress: analytics.weeklyProgress || [],
      monthlyProgress: analytics.monthlyProgress || [],
      recommendations: recommendation || {
        weakTopics: [],
        strongTopics: [],
        suggestions: ["Upload course material to start learning", "Take a quiz to generate performance recommendations"],
        recommendedStudyTime: 30
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving dashboard insights', error: error.message });
  }
};

/**
 * Fetch detailed quiz history with search and filter capabilities
 * @route GET /api/analytics/history
 */
exports.getQuizHistory = async (req, res) => {
  const { topic, difficulty, scoreMin, scoreMax, type, startDate, endDate, fileName } = req.query;

  try {
    const filter = { user: req.user._id };

    // Topic search (regex)
    if (topic) {
      filter.topic = { $regex: topic, $options: 'i' };
    }

    // Difficulty filter
    if (difficulty) {
      filter.difficulty = difficulty.toLowerCase();
    }

    // Score range
    if (scoreMin || scoreMax) {
      filter.percentage = {};
      if (scoreMin) filter.percentage.$gte = parseFloat(scoreMin);
      if (scoreMax) filter.percentage.$lte = parseFloat(scoreMax);
    }

    // Question Type
    if (type) {
      filter.questionTypes = { $in: [type] };
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    let results = await Result.find(filter)
      .populate({
        path: 'quiz',
        populate: [
          { path: 'file', select: 'originalName filename' },
          { path: 'questions' }
        ]
      })
      .sort({ date: -1 });

    // Filter by original file name if specified in query (since it's a deep lookup)
    if (fileName && results.length > 0) {
      results = results.filter(r => {
        const fileObj = r.quiz && r.quiz.file;
        return fileObj && fileObj.originalName.toLowerCase().includes(fileName.toLowerCase());
      });
    }

    res.json(results);
  } catch (error) {
    console.error('Quiz history query error:', error);
    res.status(500).json({ message: 'Server error fetching history records', error: error.message });
  }
};

/**
 * Fetch learning analytics graph data (topic-wise distributions)
 * @route GET /api/analytics/charts
 */
exports.getChartData = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Bar Chart: Topic-wise performance
    const progresses = await Progress.find({ user: userId });
    const topicPerformance = progresses.map(p => ({
      topic: p.topic,
      averageScore: p.averageScore,
      highestScore: p.highestScore,
      quizzesTaken: p.quizHistory.length
    }));

    // 2. Pie Chart: Total correct vs wrong questions
    const results = await Result.find({ user: userId });
    let totalCorrect = 0;
    let totalWrong = 0;
    results.forEach(r => {
      totalCorrect += r.correctQuestions;
      totalWrong += r.wrongQuestions;
    });

    // 3. Radar Chart: Skill comparison
    // We can compute competency vectors along 5 key learning indicators:
    // Speed (how fast they complete - higher score is better), Accuracy, Difficulty competency (Hard success), Consistency (count of quizzes), and Knowledge retention (average score)
    let avgTimePerQuestion = 0;
    let accuracyRate = 0;
    let hardDifficultyScore = 0;
    let totalQuizzes = results.length;
    let retentionScore = 0;

    if (totalQuizzes > 0) {
      const totalQuestionsCount = results.reduce((sum, r) => sum + r.totalQuestions, 0);
      const totalSecs = results.reduce((sum, r) => sum + r.timeTaken, 0);
      avgTimePerQuestion = totalQuestionsCount > 0 ? totalSecs / totalQuestionsCount : 0;
      
      accuracyRate = totalQuestionsCount > 0 ? (totalCorrect / totalQuestionsCount) * 100 : 0;
      
      const hardQuizzes = results.filter(r => r.difficulty === 'hard');
      hardDifficultyScore = hardQuizzes.length > 0
        ? hardQuizzes.reduce((sum, r) => sum + r.percentage, 0) / hardQuizzes.length
        : 0;

      retentionScore = results.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes;
    }

    // Convert average speed to a 0-100 rating (e.g. 5 seconds/question = 100 competency, 60 seconds/question = 20)
    let speedRating = 100 - (avgTimePerQuestion * 1.5);
    speedRating = Math.max(10, Math.min(100, isNaN(speedRating) ? 50 : speedRating));

    // Consistency rating based on quizzes taken (e.g. 10 quizzes = 100 competency)
    const consistencyRating = Math.min(100, totalQuizzes * 10);

    const skillComparison = [
      { subject: 'Speed (Time Efficiency)', A: parseFloat(speedRating.toFixed(1)), fullMark: 100 },
      { subject: 'Accuracy (Correct Rate)', A: parseFloat(accuracyRate.toFixed(1)), fullMark: 100 },
      { subject: 'Advanced Concepts (Hard)', A: parseFloat(hardDifficultyScore.toFixed(1)), fullMark: 100 },
      { subject: 'Consistency (Quizzes Done)', A: parseFloat(consistencyRating.toFixed(1)), fullMark: 100 },
      { subject: 'Retention (Average Score)', A: parseFloat(retentionScore.toFixed(1)), fullMark: 100 }
    ];

    res.json({
      topicPerformance,
      questionDistribution: [
        { name: 'Correct Answers', value: totalCorrect },
        { name: 'Incorrect Answers', value: totalWrong }
      ],
      skillComparison
    });
  } catch (error) {
    console.error('Chart statistics error:', error);
    res.status(500).json({ message: 'Server error loading statistics data', error: error.message });
  }
};

/* ==========================================================================
   ADMIN CONTROLLER ENDPOINTS
   ========================================================================== */

/**
 * Fetch all platform users
 * @route GET /api/analytics/admin/users
 */
exports.adminGetUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Admin retrieve users error', error: error.message });
  }
};

/**
 * Fetch all platform documents
 * @route GET /api/analytics/admin/documents
 */
exports.adminGetDocuments = async (req, res) => {
  try {
    const documents = await File.find({}).populate('user', 'username email').sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Admin retrieve documents error', error: error.message });
  }
};

/**
 * Delete a user and associated records
 * @route DELETE /api/analytics/admin/users/:userId
 */
exports.adminDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent delete self
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot delete their own profile' });
    }

    await User.findByIdAndDelete(userId);
    await File.deleteMany({ user: userId });
    await ExtractedText.deleteMany({ user: userId });
    await Result.deleteMany({ user: userId });
    await Progress.deleteMany({ user: userId });
    await Recommendation.deleteMany({ user: userId });
    await Analytics.deleteMany({ user: userId });

    res.json({ message: 'User and all associated academic records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Admin delete user error', error: error.message });
  }
};

/**
 * Monitor global stats (AI tokens/files metrics)
 * @route GET /api/analytics/admin/usage
 */
exports.adminGetAIUsage = async (req, res) => {
  try {
    const totalFiles = await File.countDocuments();
    const totalQuizzes = await Result.countDocuments();
    const totalUsers = await User.countDocuments();

    // Group files by type
    const filesGroup = await File.aggregate([
      { $group: { _id: '$mimeType', count: { $sum: 1 } } }
    ]);

    res.json({
      totalUsers,
      totalFilesUploaded: totalFiles,
      totalQuizzesGenerated: totalQuizzes,
      fileTypeDistribution: filesGroup,
      aiIntegrationStatus: {
        geminiActive: !!process.env.GEMINI_API_KEY,
        openAIActive: !!process.env.OPENAI_API_KEY
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Admin AI usage metrics error', error: error.message });
  }
};
