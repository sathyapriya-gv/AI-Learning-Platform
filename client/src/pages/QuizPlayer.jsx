import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckSquare, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle
} from 'lucide-react';

const QuizPlayer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Read quiz details from location state
  const quiz = location?.state?.quiz || null;
  const fileName = location?.state?.fileName || '';

  if (!quiz) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <GlassCard className="border border-white/5 p-8">
          <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-200">No Active Quiz Found</h2>
          <p className="text-sm text-slate-400 mt-2 mb-6">Please configure and generate a quiz first.</p>
          <button 
            onClick={() => navigate('/upload')} 
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            Go to Uploads
          </button>
        </GlassCard>
      </div>
    );
  }

  const { questions, _id: quizId, topic, difficulty } = quiz;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // Stores questionId -> userResponse
  const [elapsedTime, setElapsedTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const timerRef = useRef(null);

  // Start elapsed timer stopwatch
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (qId, ansVal) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: ansVal,
    }));
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const skipQuestion = () => {
    // Record empty answer if skipped
    const currentQuestionId = questions[currentIdx]._id;
    if (answers[currentQuestionId] === undefined) {
      handleSelectAnswer(currentQuestionId, '');
    }
    nextQuestion();
  };

  const handleSubmitQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    setErrorMsg('');

    // Package answers
    const formattedAnswers = questions.map((q) => ({
      questionId: q._id,
      answer: answers[q._id] !== undefined ? answers[q._id] : '',
    }));

    try {
      const response = await api.post('/quiz/submit', {
        quizId,
        answers: formattedAnswers,
        timeTaken: elapsedTime,
      });

      // Navigate to detailed results view page
      navigate('/quiz-results', { 
        state: { 
          results: response.data,
          topic,
          difficulty,
          fileName
        } 
      });
    } catch (err) {
      console.error('Quiz submission error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit quiz scores. Please try again.');
      setSubmitting(false);
      // Restart timer if submission failed
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const currentQuestion = questions[currentIdx];
  const progressPercent = ((currentIdx + 1) / questions.length) * 100;
  const isLastQuestion = currentIdx === questions.length - 1;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto animate-fade-up">
      
      {/* Quiz Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">{topic}</h2>
          <p className="text-xs text-slate-400 mt-0.5 capitalize">Difficulty: <span className="font-semibold text-slate-300">{difficulty}</span></p>
        </div>
        
        {/* Stopwatch display */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-glassborder text-indigo-400 font-semibold text-sm">
          <Clock className="h-4 w-4" />
          <span>{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>{Math.round(progressPercent)}% Complete</span>
        </div>
        <div className="w-full bg-slate-900/60 h-2.5 rounded-full overflow-hidden border border-glassborder">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-300 shadow-neonIndigo" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card Panel */}
      <GlassCard className="border border-white/5 p-8 min-h-[320px] flex flex-col justify-between">
        
        {submitting ? (
          /* Submission Loading View */
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 my-auto">
            <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="text-lg font-bold text-slate-200">Evaluating Your Responses</h3>
              <p className="text-xs text-slate-400 mt-1">Cross-matching definitions and loading study recommendations...</p>
            </div>
          </div>
        ) : (
          /* Real Question Content */
          <div className="space-y-6">
            
            {/* Question Text */}
            <h3 className="text-lg font-bold text-slate-100 leading-relaxed">
              {currentQuestion.questionText}
            </h3>

            {/* Input Selection Block */}
            <div className="pt-2">
              
              {/* Type 1: Multiple Choice */}
              {currentQuestion.type === 'mcq' && (
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = answers[currentQuestion._id] === idx.toString();
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(currentQuestion._id, idx.toString())}
                        className={`w-full text-left text-sm px-5 py-4 rounded-xl border font-medium transition-all ${
                          isSelected 
                            ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 shadow-neonIndigo'
                            : 'bg-slate-900/40 border-glassborder text-slate-300 hover:bg-slate-800/40'
                        }`}
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-400 mr-3 border border-glassborder">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Type 2: True/False */}
              {currentQuestion.type === 'true_false' && (
                <div className="grid grid-cols-2 gap-4">
                  {['True', 'False'].map((option) => {
                    const isSelected = answers[currentQuestion._id] === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleSelectAnswer(currentQuestion._id, option)}
                        className={`py-5 rounded-2xl border text-sm font-bold transition-all text-center ${
                          isSelected 
                            ? option === 'True' 
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-emerald-500/10'
                              : 'bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-rose-500/10'
                            : 'bg-slate-900/40 border-glassborder text-slate-300 hover:bg-slate-800/40'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Type 3: Fill in the Blanks */}
              {currentQuestion.type === 'fill_in_the_blanks' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={answers[currentQuestion._id] || ''}
                    onChange={(e) => handleSelectAnswer(currentQuestion._id, e.target.value)}
                    className="w-full bg-slate-900/60 border border-glassborder rounded-xl py-3.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                    placeholder="Type the correct missing word..."
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-500">Note: Spelling must match text concepts exactly.</p>
                </div>
              )}

              {/* Type 4: Short Conceptual Answer */}
              {currentQuestion.type === 'short_answer' && (
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={answers[currentQuestion._id] || ''}
                    onChange={(e) => handleSelectAnswer(currentQuestion._id, e.target.value)}
                    className="w-full bg-slate-900/60 border border-glassborder rounded-xl py-3.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium leading-relaxed resize-none"
                    placeholder="Write your explanation or details here..."
                  />
                  <p className="text-[10px] text-slate-500">Grading checks for word matches and logical arguments outlined in the course notes.</p>
                </div>
              )}

            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                {errorMsg}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between border-t border-glassborder pt-6 mt-6">
              
              {/* Back button */}
              <button
                type="button"
                onClick={prevQuestion}
                disabled={currentIdx === 0}
                className="flex items-center space-x-1 px-4 py-2.5 rounded-xl border border-glassborder bg-slate-900/20 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:bg-transparent transition-all text-xs font-semibold"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {/* Skip button */}
              {!isLastQuestion && (
                <button
                  type="button"
                  onClick={skipQuestion}
                  className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-300 text-xs font-semibold transition-colors"
                >
                  Skip Question
                </button>
              )}

              {/* Next or Submit */}
              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-neonIndigo transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Quiz</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="flex items-center space-x-1 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-neonIndigo transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}

            </div>

          </div>
        )}

      </GlassCard>

    </div>
  );
};

export default QuizPlayer;
