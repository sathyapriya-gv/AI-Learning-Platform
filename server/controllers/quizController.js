const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const ExtractedText = require('../models/ExtractedText');
const Progress = require('../models/Progress');
const Analytics = require('../models/Analytics');
const Recommendation = require('../models/Recommendation');
const aiService = require('../services/aiService');

/**
 * Generate a new Quiz
 * @route POST /api/quiz/generate
 */
exports.generateQuiz = async (req, res) => {
  const { fileId, topic, difficulty, questionTypes, numQuestions } = req.body;

  try {
    if (!topic || !difficulty || !questionTypes || !numQuestions) {
      return res.status(400).json({ message: 'Missing required quiz generation parameters' });
    }

    let sourceText = '';

    if (fileId) {
      const textRecord = await ExtractedText.findOne({ file: fileId, user: req.user._id });
      if (!textRecord) {
        return res.status(404).json({ message: 'No learning material text found for this file' });
      }
      sourceText = textRecord.text;
      if (!sourceText || sourceText.trim().length < 20) {
        return res.status(400).json({ message: 'The uploaded file does not contain enough extracted learning content to generate a quiz.' });
      }
    } else {
      sourceText = `Quiz Topic: ${topic}. Generation context: ${difficulty} level quiz.`;
    }

    // 1. Generate questions using AI service
    const generatedQuestions = await aiService.generateQuiz(
      sourceText,
      questionTypes,
      parseInt(numQuestions),
      difficulty
    );

    // 2. Create Quiz record
    const quiz = await Quiz.create({
      user: req.user._id,
      file: fileId || null,
      topic,
      difficulty,
      questionTypes,
    });

    // 3. Create individual Question records
    const questionDocs = generatedQuestions.map((q) => ({
      quiz: quiz._id,
      type: q.type,
      questionText: q.questionText,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
    }));

    const savedQuestions = await Question.insertMany(questionDocs);

    // 4. Update Quiz with saved question references
    quiz.questions = savedQuestions.map((q) => q._id);
    await quiz.save();

    // 5. Respond with quiz details (exclude correctAnswer & explanation for security during testing)
    const clientQuestions = savedQuestions.map((q) => ({
      _id: q._id,
      type: q.type,
      questionText: q.questionText,
      options: q.options,
    }));

    res.status(201).json({
      _id: quiz._id,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      questionTypes: quiz.questionTypes,
      questions: clientQuestions,
    });
  } catch (error) {
    console.error('Quiz generation controller error:', error);
    res.status(500).json({ message: 'Server error generating quiz', error: error.message });
  }
};

/**
 * Submit Quiz Answers and Grade Performance
 * @route POST /api/quiz/submit
 */
exports.submitQuiz = async (req, res) => {
  const { quizId, answers, timeTaken } = req.body; // answers = [{ questionId, answer }]

  try {
    if (!quizId || !answers || timeTaken === undefined) {
      return res.status(400).json({ message: 'Missing quiz submission details' });
    }

    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    const gradedQuestions = [];
    const answerMap = new Map(answers.map((a) => [a.questionId.toString(), a.answer]));

    // Grade each question
    quiz.questions.forEach((q) => {
      const qId = q._id.toString();
      const userAnswer = answerMap.get(qId) !== undefined ? answerMap.get(qId) : '';
      const correctAnswer = q.correctAnswer;
      
      let isCorrect = false;

      if (q.type === 'mcq') {
        isCorrect = userAnswer.toString().trim() === correctAnswer.toString().trim();
      } else if (q.type === 'true_false') {
        isCorrect = userAnswer.toString().toLowerCase().trim() === correctAnswer.toString().toLowerCase().trim();
      } else if (q.type === 'fill_in_the_blanks') {
        isCorrect = userAnswer.toString().toLowerCase().trim() === correctAnswer.toString().toLowerCase().trim();
      } else if (q.type === 'short_answer') {
        // Dynamic similarity grading: check if user response shares key words
        const userWords = new Set(userAnswer.toString().toLowerCase().split(/\s+/).filter(w => w.length > 3));
        const modelWords = correctAnswer.toString().toLowerCase().split(/\s+/).filter(w => w.length > 3);
        
        let matchCount = 0;
        modelWords.forEach((word) => {
          if (userWords.has(word)) matchCount++;
        });

        // If at least 30% word match or minimum length matches core, consider correct
        const matchRatio = modelWords.length > 0 ? matchCount / modelWords.length : 0;
        isCorrect = matchRatio >= 0.25 || (userAnswer.toString().length > 15 && matchRatio > 0);
      }

      if (isCorrect) {
        score++;
      }

      gradedQuestions.push({
        questionId: q._id,
        type: q.type,
        questionText: q.questionText,
        options: q.options,
        userAnswer,
        correctAnswer,
        explanation: q.explanation,
        isCorrect,
      });
    });

    const totalQuestions = quiz.questions.length;
    const percentage = parseFloat(((score / totalQuestions) * 100).toFixed(1));
    const correctQuestions = score;
    const wrongQuestions = totalQuestions - score;

    // Calculate improvement percentage
    let improvementPercentage = 0;
    const previousResult = await Result.findOne({
      user: req.user._id,
      topic: quiz.topic,
    }).sort({ date: -1 });

    if (previousResult) {
      improvementPercentage = parseFloat((percentage - previousResult.percentage).toFixed(1));
    }

    // Determine topic categorization
    const strongTopics = [];
    const weakTopics = [];

    if (percentage >= 75) {
      strongTopics.push(quiz.topic);
    } else {
      weakTopics.push(quiz.topic);
    }

    // Call AI to get custom feedback
    let aiFeedback = {};
    try {
      aiFeedback = await aiService.generateAIFeedbackText(
        score,
        totalQuestions,
        percentage,
        weakTopics,
        strongTopics
      );
    } catch (feedbackErr) {
      console.error('Error generating AI feedback:', feedbackErr);
      // Fallback local feedback
      aiFeedback = {
        message: percentage >= 75 ? "Excellent job!" : "Good attempt, keep practicing!",
        strongFeedback: percentage >= 75 ? `You proved you have great comprehension of ${quiz.topic}` : "You got some questions correct.",
        weakFeedback: percentage < 75 ? `Review ${quiz.topic} sections where you struggled.` : "No major weaknesses observed.",
        recommendedStudyTime: percentage >= 75 ? 20 : 45,
        actionSteps: ["Go through the answers list below", "Re-read the learning material on weak points"]
      };
    }

    // Save result record
    const resultRecord = await Result.create({
      user: req.user._id,
      quiz: quiz._id,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      questionTypes: quiz.questionTypes,
      score,
      totalQuestions,
      percentage,
      timeTaken,
      correctQuestions,
      wrongQuestions,
      improvementPercentage,
      weakTopics,
      strongTopics,
      aiFeedback,
    });

    // Update Progress
    let progress = await Progress.findOne({ user: req.user._id, topic: quiz.topic });
    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        topic: quiz.topic,
        quizHistory: [],
      });
    }

    progress.quizHistory.push({
      quiz: quiz._id,
      result: resultRecord._id,
      percentage,
      score,
      date: resultRecord.date,
    });

    // Recalculate average/highest
    const totalPercentage = progress.quizHistory.reduce((sum, h) => sum + h.percentage, 0);
    progress.averageScore = parseFloat((totalPercentage / progress.quizHistory.length).toFixed(1));
    progress.highestScore = Math.max(...progress.quizHistory.map(h => h.percentage));
    
    // Improvement from first quiz
    const firstQuizPercentage = progress.quizHistory[0].percentage;
    const latestQuizPercentage = percentage;
    progress.improvementPercentage = parseFloat((latestQuizPercentage - firstQuizPercentage).toFixed(1));
    progress.lastUpdated = new Date();
    await progress.save();

    // Update User Analytics
    let analytics = await Analytics.findOne({ user: req.user._id });
    if (!analytics) {
      analytics = new Analytics({
        user: req.user._id,
        weeklyProgress: [],
        monthlyProgress: [],
      });
    }

    const allResults = await Result.find({ user: req.user._id });
    analytics.totalQuizzesTaken = allResults.length;
    
    const sumAllScores = allResults.reduce((sum, r) => sum + r.percentage, 0);
    analytics.averageScore = parseFloat((sumAllScores / allResults.length).toFixed(1));
    analytics.highestScore = Math.max(...allResults.map(r => r.percentage));

    // Update weekly progress
    const dateObj = new Date();
    const currentYear = dateObj.getFullYear();
    // Helper to get week number
    const oneJan = new Date(currentYear, 0, 1);
    const numberOfDays = Math.floor((dateObj - oneJan) / (24 * 60 * 60 * 1000));
    const currentWeekStr = `Week ${Math.ceil((dateObj.getDay() + 1 + numberOfDays) / 7)}`;

    const weekIdx = analytics.weeklyProgress.findIndex(w => w.week === currentWeekStr);
    if (weekIdx > -1) {
      const currentWeekData = analytics.weeklyProgress[weekIdx];
      const newCount = currentWeekData.count + 1;
      currentWeekData.average = parseFloat(((currentWeekData.average * currentWeekData.count + percentage) / newCount).toFixed(1));
      currentWeekData.count = newCount;
    } else {
      analytics.weeklyProgress.push({ week: currentWeekStr, average: percentage, count: 1 });
    }

    // Update monthly progress
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthStr = `${monthNames[dateObj.getMonth()]} ${currentYear}`;

    const monthIdx = analytics.monthlyProgress.findIndex(m => m.month === currentMonthStr);
    if (monthIdx > -1) {
      const currentMonthData = analytics.monthlyProgress[monthIdx];
      const newCount = currentMonthData.count + 1;
      currentMonthData.average = parseFloat(((currentMonthData.average * currentMonthData.count + percentage) / newCount).toFixed(1));
      currentMonthData.count = newCount;
    } else {
      analytics.monthlyProgress.push({ month: currentMonthStr, average: percentage, count: 1 });
    }

    analytics.lastUpdated = new Date();
    await analytics.save();

    // Recalculate recommendation engine
    await updateRecommendations(req.user._id, aiFeedback);

    res.json({
      resultId: resultRecord._id,
      score,
      totalQuestions,
      percentage,
      timeTaken,
      correctQuestions,
      wrongQuestions,
      improvementPercentage,
      aiFeedback,
      gradedQuestions,
    });
  } catch (error) {
    console.error('Quiz submission controller error:', error);
    res.status(500).json({ message: 'Server error submitting quiz', error: error.message });
  }
};

/**
 * Recalculates recommendation profiles based on overall subject history
 */
async function updateRecommendations(userId, latestFeedback) {
  try {
    const progresses = await Progress.find({ user: userId });
    
    const weakTopics = [];
    const strongTopics = [];

    progresses.forEach((p) => {
      if (p.averageScore < 60) {
        weakTopics.push({
          topic: p.topic,
          averageScore: p.averageScore,
          reason: `Your average score in this topic is ${p.averageScore}%, which is below the benchmark of 60%.`,
        });
      } else {
        strongTopics.push({
          topic: p.topic,
          averageScore: p.averageScore,
        });
      }
    });

    let suggestions = [];
    let recommendedStudyTime = 30;

    if (latestFeedback && latestFeedback.actionSteps) {
      suggestions = latestFeedback.actionSteps;
    } else {
      suggestions = ["Review core text blocks for weak subjects", "Practice at least one 10-question quiz daily"];
    }

    if (latestFeedback && latestFeedback.recommendedStudyTime) {
      recommendedStudyTime = latestFeedback.recommendedStudyTime;
    } else if (weakTopics.length > 0) {
      recommendedStudyTime = 45;
    }

    let recommendation = await Recommendation.findOne({ user: userId });
    if (!recommendation) {
      recommendation = new Recommendation({ user: userId });
    }

    recommendation.weakTopics = weakTopics;
    recommendation.strongTopics = strongTopics;
    recommendation.suggestions = suggestions;
    recommendation.recommendedStudyTime = recommendedStudyTime;
    recommendation.lastUpdated = new Date();
    await recommendation.save();
  } catch (err) {
    console.error('Error updating learning recommendations:', err);
  }
}
