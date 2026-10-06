import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  HelpCircle,
  Eye,
  Trash2,
  AlertCircle
} from 'lucide-react';

const HistoryPage = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Search/Filter parameters state
  const [topic, setTopic] = useState('');
  const [fileName, setFileName] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [type, setType] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (topic) params.topic = topic;
      if (fileName) params.fileName = fileName;
      if (difficulty) params.difficulty = difficulty;
      if (type) params.type = type;

      const response = await api.get('/analytics/history', { params });
      setHistory(response.data);
    } catch (err) {
      console.error('Error fetching quiz history:', err);
      setErrorMsg('Failed to query quiz history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, type]); // Auto fetch when selecting category dropdown filters

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const resetFilters = () => {
    setTopic('');
    setFileName('');
    setDifficulty('');
    setType('');
    // Trigger reset fetch
    setHistory([]);
    setLoading(true);
    api.get('/analytics/history')
      .then(res => setHistory(res.data))
      .catch(() => setErrorMsg('Reset failed.'))
      .finally(() => setLoading(false));
  };

  const viewDetails = (result) => {
    // Build gradedQuestions from quiz questions
    const gradedQuestions = result.quiz && result.quiz.questions && Array.isArray(result.quiz.questions)
      ? result.quiz.questions.map(q => ({
          questionText: q.questionText,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          isCorrect: true,
          userAnswer: q.correctAnswer
        }))
      : [];

    navigate('/quiz-results', {
      state: {
        results: {
          score: result.score,
          totalQuestions: result.totalQuestions,
          percentage: result.percentage,
          timeTaken: result.timeTaken,
          correctQuestions: result.correctQuestions,
          wrongQuestions: result.wrongQuestions,
          improvementPercentage: result.improvementPercentage,
          aiFeedback: result.aiFeedback || {},
          gradedQuestions: gradedQuestions
        },
        topic: result.topic,
        difficulty: result.difficulty,
        fileName: result.quiz?.file?.originalName || ''
      }
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fade-up">
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
          Quiz History
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Review, search, and analyze your performance logs across previous practice tests.
        </p>
      </div>

      {/* Filter panel */}
      <GlassCard className="border border-white/5 p-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          
          {/* Topic Search */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Topic</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-900/60 border border-glassborder rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="e.g. Java Loops"
              />
            </div>
          </div>

          {/* File Name Search */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">File Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full bg-slate-900/60 border border-glassborder rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="e.g. midterm.pdf"
              />
            </div>
          </div>

          {/* Difficulty Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-900/60 border border-glassborder rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-semibold"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Question Type Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Format</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-900/60 border border-glassborder rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-semibold"
            >
              <option value="">All Formats</option>
              <option value="mcq">MCQ Only</option>
              <option value="true_false">True / False</option>
              <option value="fill_in_the_blanks">Fillups</option>
              <option value="short_answer">Short Conceptual</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-neonIndigo"
            >
              Search
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="flex-1 bg-slate-800 hover:bg-slate-700 border border-glassborder text-slate-300 font-bold py-2 rounded-xl text-xs transition-all"
            >
              Reset
            </button>
          </div>

        </form>
      </GlassCard>

      {/* History table list */}
      <GlassCard className="border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : errorMsg ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {errorMsg}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <AlertCircle className="h-10 w-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No History Records Match Your Filters</h3>
            <p className="text-xs text-slate-500">Try modifying your query terms or reset filters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/40 border-b border-glassborder">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Uploaded File</th>
                  <th className="py-3.5 px-4 font-semibold">Topic</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Score</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Percentage</th>
                  <th className="py-3.5 px-4 text-center font-semibold">Improvement</th>
                  <th className="py-3.5 px-6 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glassborder bg-slate-900/10">
                {history.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                        <span>
                          {new Date(item.date).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-300 truncate max-w-[150px]">
                      {item.quiz?.file?.originalName ? (
                        <span title={item.quiz.file.originalName}>{item.quiz.file.originalName}</span>
                      ) : (
                        <span className="text-slate-500 italic">Custom Entry</span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-200">{item.topic}</td>
                    <td className="py-4 px-4 text-xs capitalize text-slate-400">
                      {item.questionTypes && item.questionTypes.length > 0
                        ? item.questionTypes.map(t => t.replace('_', ' ')).join(', ')
                        : 'Custom Quiz'}
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-slate-200">
                      {item.score} / {item.totalQuestions}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-bold text-sm ${
                        item.percentage >= 75 ? 'text-emerald-400' :
                        item.percentage >= 50 ? 'text-amber-400' :
                        'text-rose-400'
                      }`}>
                        {item.percentage}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-xs">
                      {item.improvementPercentage !== undefined && (
                        <span className={`font-semibold ${
                          item.improvementPercentage > 0 ? 'text-emerald-400' :
                          item.improvementPercentage < 0 ? 'text-rose-400' :
                          'text-slate-400'
                        }`}>
                          {item.improvementPercentage > 0 ? `+${item.improvementPercentage}%` :
                           item.improvementPercentage < 0 ? `${item.improvementPercentage}%` :
                           '0%'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => viewDetails(item)}
                        className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/25 transition-all text-xs font-bold flex items-center space-x-1 ml-auto group"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">View Details</span>
                        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

    </div>
  );
};

export default HistoryPage;
