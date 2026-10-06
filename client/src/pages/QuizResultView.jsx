import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  LayoutDashboard,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';

const QuizResultView = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Read results payload from state
  const results = location.state?.results || null;
  const topic = location.state?.topic || '';
  const difficulty = location.state?.difficulty || '';
  const fileName = location.state?.fileName || '';

  if (!results) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <GlassCard className="border border-white/5 p-8">
          <AlertTriangle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-200">No Results Found</h2>
          <p className="text-sm text-slate-400 mt-2 mb-6">Take a quiz first to inspect grading details.</p>
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

  const { 
    score, 
    totalQuestions, 
    percentage, 
    timeTaken, 
    correctQuestions, 
    wrongQuestions, 
    improvementPercentage, 
    aiFeedback, 
    gradedQuestions 
  } = results;

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getOptionLetter = (idx) => String.fromCharCode(65 + parseInt(idx));

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto animate-fade-up">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
          Quiz Evaluation
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review your score details, item-by-item solutions, and custom study plans.
        </p>
      </div>

      {/* Main Results Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Score & Feedback Column */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Main Card */}
          <GlassCard className="border border-white/5 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Background glowing circle */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

            <div className="h-16 w-16 bg-indigo-600/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/20">
              <Trophy className="h-8 w-8 text-indigo-400 animate-pulse-glow" />
            </div>

            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Topic Completed</p>
            <h2 className="text-2xl font-extrabold text-slate-100 font-sans mt-1">{topic}</h2>
            
            {/* Centered Large Grade Indicator */}
            <div className="my-6">
              <h3 className={`text-6xl font-black ${
                percentage >= 75 ? 'text-emerald-400' :
                percentage >= 50 ? 'text-amber-400' :
                'text-rose-400'
              }`}>
                {percentage}%
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                Scored <span className="font-semibold text-slate-200">{score} out of {totalQuestions}</span> correct
              </p>
            </div>

            {/* Performance tags */}
            <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-glassborder text-left">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Duration</span>
                <div className="flex items-center space-x-1 text-sm font-semibold text-slate-300">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  <span>{formatTime(timeTaken)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Improvement</span>
                <div className={`flex items-center space-x-1 text-sm font-semibold ${
                  improvementPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  <TrendingUpIcon className="h-4 w-4" />
                  <span>{improvementPercentage >= 0 ? `+${improvementPercentage}%` : `${improvementPercentage}%`}</span>
                </div>
              </div>
            </div>

          </GlassCard>

          {/* AI Suggestions Box */}
          {aiFeedback && (
            <GlassCard className="border border-indigo-500/20 bg-indigo-600/5 p-6 space-y-4">
              <div className="flex items-start space-x-3.5">
                <div className="p-2 bg-indigo-500/25 text-indigo-300 rounded-lg shrink-0 mt-0.5">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-200">AI Study Feedback</h3>
                    <p className="text-xs text-indigo-400/90 font-semibold mt-0.5">Suggested Practice Time: {aiFeedback.recommendedStudyTime} minutes</p>
                  </div>
                  
                  <div className="text-sm text-slate-300 space-y-2 leading-relaxed">
                    <p>{aiFeedback.message}</p>
                    <p className="text-xs text-slate-400">{aiFeedback.strongFeedback} {aiFeedback.weakFeedback}</p>
                  </div>

                  {aiFeedback.actionSteps && aiFeedback.actionSteps.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Steps:</p>
                      <ul className="list-disc list-inside text-xs text-indigo-300 space-y-1.5 pl-1">
                        {aiFeedback.actionSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          )}

        </div>

        {/* Small stats and Navigation column */}
        <div className="space-y-4">
          <GlassCard className="border border-white/5 p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-200">Breakdown</h3>
            
            <div className="space-y-4 text-xs font-medium text-slate-300">
              <div className="flex justify-between items-center pb-2 border-b border-glassborder">
                <span className="text-slate-400">Correct Questions</span>
                <span className="text-emerald-400 font-bold flex items-center"><CheckCircle2 className="h-4 w-4 mr-1" /> {correctQuestions}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-glassborder">
                <span className="text-slate-400">Wrong Questions</span>
                <span className="text-rose-400 font-bold flex items-center"><XCircle className="h-4 w-4 mr-1" /> {wrongQuestions}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-glassborder">
                <span className="text-slate-400">Difficulty Setting</span>
                <span className="capitalize font-bold text-slate-200">{difficulty}</span>
              </div>
              {fileName && (
                <div className="flex justify-between items-start">
                  <span className="text-slate-400">Source Document</span>
                  <span className="font-semibold text-slate-200 text-right truncate max-w-[120px]" title={fileName}>{fileName}</span>
                </div>
              )}
            </div>

            <div className="space-y-2.5 pt-4">
              <Link
                to="/upload"
                className="w-full flex items-center justify-center space-x-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-neonIndigo transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Take Another Quiz</span>
              </Link>
              <Link
                to="/"
                className="w-full flex items-center justify-center space-x-1 px-4 py-3 bg-slate-900/60 hover:bg-slate-800 border border-glassborder text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </GlassCard>
        </div>

      </div>

      {/* Item-by-item solutions list */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-200 font-sans">Solutions & Explanations</h3>
        
        <div className="space-y-4">
          {gradedQuestions.map((q, idx) => (
            <GlassCard key={idx} className={`border p-6 ${q.isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
              
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  
                  {/* Title and Question */}
                  <div className="flex items-start space-x-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-950/40 text-xs font-bold text-slate-400 shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <h4 className="text-base font-semibold text-slate-100 leading-snug">
                      {q.questionText}
                    </h4>
                  </div>

                  {/* Question details (MCQ option lists, etc.) */}
                  {q.type === 'mcq' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9 pt-2">
                      {q.options.map((option, optIdx) => {
                        const isCorrectOpt = optIdx.toString() === q.correctAnswer;
                        const isSelectedOpt = optIdx.toString() === q.userAnswer;
                        return (
                          <div 
                            key={optIdx} 
                            className={`text-xs p-3 rounded-lg border font-medium ${
                              isCorrectOpt 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : isSelectedOpt
                                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                  : 'bg-slate-900/40 border-glassborder text-slate-400'
                            }`}
                          >
                            <span className="font-bold mr-1.5">{getOptionLetter(optIdx)}.</span> {option}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* User response detail */}
                  <div className="pl-9 pt-2 text-xs space-y-1.5">
                    
                    <p className="text-slate-400">
                      Your Answer:{' '}
                      <span className={`font-bold ${q.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {q.type === 'mcq' && q.userAnswer !== '' ? `${getOptionLetter(q.userAnswer)}. ${q.options[q.userAnswer]}` :
                         q.userAnswer === '' ? 'Skipped' : q.userAnswer}
                      </span>
                    </p>
                    
                    {!q.isCorrect && (
                      <p className="text-slate-400">
                        Correct Answer:{' '}
                        <span className="font-bold text-emerald-400">
                          {q.type === 'mcq' ? `${getOptionLetter(q.correctAnswer)}. ${q.options[q.correctAnswer]}` : q.correctAnswer}
                        </span>
                      </p>
                    )}

                  </div>

                  {/* AI Explanation block */}
                  {q.explanation && (
                    <div className="pl-9 pt-3 mt-3 border-t border-glassborder/50 text-xs text-slate-400 leading-relaxed">
                      <p className="font-semibold text-slate-300 mb-1">AI Explanation:</p>
                      <p>{q.explanation}</p>
                    </div>
                  )}

                </div>

                {/* Score Indicator Icon */}
                <div className="shrink-0">
                  {q.isCorrect ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <XCircle className="h-6 w-6 text-rose-400" />
                  )}
                </div>

              </div>

            </GlassCard>
          ))}
        </div>
      </div>

    </div>
  );
};

// Local Icon Helper to avoid missing import errors
const TrendingUpIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

export default QuizResultView;
