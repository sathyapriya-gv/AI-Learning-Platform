import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { Settings, HelpCircle, AlertTriangle, Play, Sparkles } from 'lucide-react';

const QuizSetup = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Read upload state references
  const initialFileId = location.state?.fileId || null;
  const initialTopic = location.state?.topic || '';
  const initialFileName = location.state?.fileName || '';

  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  
  // Selected question types
  const [questionTypes, setQuestionTypes] = useState({
    mcq: true,
    fill_in_the_blanks: false,
    true_false: true,
    short_answer: false,
  });

  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleType = (type) => {
    setQuestionTypes(prev => {
      const copy = { ...prev, [type]: !prev[type] };
      // Ensure at least one type is selected
      const selectedCount = Object.values(copy).filter(Boolean).length;
      if (selectedCount === 0) return prev;
      return copy;
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      return setErrorMsg('Please specify a quiz topic');
    }

    const activeTypes = Object.entries(questionTypes)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => type);

    setErrorMsg('');
    setLoading(true);
    setStatusText('AI is reading the source text content...');

    try {
      setTimeout(() => setStatusText('Generating conceptual questions...'), 2000);
      setTimeout(() => setStatusText('Formulating correct answers and detailed explanations...'), 4500);

      const response = await api.post('/quiz/generate', {
        fileId: initialFileId,
        topic,
        difficulty,
        questionTypes: activeTypes,
        numQuestions,
      });

      // Navigate to Quiz Player
      navigate('/quiz-player', { 
        state: { 
          quiz: response.data,
          fileName: initialFileName
        } 
      });
    } catch (err) {
      console.error('Quiz generation error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto animate-fade-up">
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans flex items-center space-x-2">
          <span>Configure Quiz</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize the scope, difficulty level, and formats of your practice test.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Settings Form */}
        <div className="md:col-span-2">
          <GlassCard className="border border-white/5 p-6">
            
            {loading ? (
              /* Generating Loader State */
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                <div className="relative">
                  <div className="h-16 w-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-indigo-400 animate-pulse-glow" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-200">Generating Your AI Quiz</h3>
                  <p className="text-xs text-indigo-400 font-semibold">{statusText}</p>
                </div>
                <p className="text-xs text-slate-500 italic max-w-sm">This can take up to 20 seconds for complex documents or multi-format question types.</p>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="space-y-6">
                
                {/* Topic Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Quiz Topic / Subject Name
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-slate-900/60 border border-glassborder rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
                    placeholder="e.g. Loops in Java, Thermodynamics"
                    required
                  />
                  {initialFileName && (
                    <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
                      Linked Material: <span className="text-indigo-400 font-semibold">{initialFileName}</span>
                    </p>
                  )}
                </div>

                {/* Question Types Checkboxes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Select Question Formats
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    <button
                      type="button"
                      onClick={() => toggleType('mcq')}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        questionTypes.mcq 
                          ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 shadow-neonIndigo'
                          : 'bg-slate-900/40 border-glassborder text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                      }`}
                    >
                      <span>Multiple Choice (MCQ)</span>
                      <input 
                        type="checkbox" 
                        checked={questionTypes.mcq} 
                        readOnly 
                        className="h-3.5 w-3.5 rounded text-indigo-600 border-glassborder focus:ring-0 cursor-pointer pointer-events-none" 
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleType('true_false')}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        questionTypes.true_false 
                          ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 shadow-neonIndigo'
                          : 'bg-slate-900/40 border-glassborder text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                      }`}
                    >
                      <span>True / False</span>
                      <input 
                        type="checkbox" 
                        checked={questionTypes.true_false} 
                        readOnly 
                        className="h-3.5 w-3.5 rounded text-indigo-600 border-glassborder focus:ring-0 cursor-pointer pointer-events-none" 
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleType('fill_in_the_blanks')}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        questionTypes.fill_in_the_blanks 
                          ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 shadow-neonIndigo'
                          : 'bg-slate-900/40 border-glassborder text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                      }`}
                    >
                      <span>Fill in the Blanks</span>
                      <input 
                        type="checkbox" 
                        checked={questionTypes.fill_in_the_blanks} 
                        readOnly 
                        className="h-3.5 w-3.5 rounded text-indigo-600 border-glassborder focus:ring-0 cursor-pointer pointer-events-none" 
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleType('short_answer')}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        questionTypes.short_answer 
                          ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400 shadow-neonIndigo'
                          : 'bg-slate-900/40 border-glassborder text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                      }`}
                    >
                      <span>Short Conceptual Answer</span>
                      <input 
                        type="checkbox" 
                        checked={questionTypes.short_answer} 
                        readOnly 
                        className="h-3.5 w-3.5 rounded text-indigo-600 border-glassborder focus:ring-0 cursor-pointer pointer-events-none" 
                      />
                    </button>

                  </div>
                </div>

                {/* Count and Difficulty Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Question Count */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Number of Questions
                    </label>
                    <select
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                      className="w-full bg-slate-900/60 border border-glassborder rounded-xl py-3 px-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer font-semibold"
                    >
                      <option value="5" className="bg-darkbg">5 Questions (Quick Test)</option>
                      <option value="10" className="bg-darkbg">10 Questions (Medium Practice)</option>
                      <option value="15" className="bg-darkbg">15 Questions (Full Assessment)</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['easy', 'medium', 'hard'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          className={`py-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                            difficulty === level 
                              ? level === 'easy' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-emerald-500/10' :
                                level === 'medium' ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-amber-500/10' :
                                'bg-rose-500/10 border-rose-500/50 text-rose-400 shadow-rose-500/10'
                              : 'bg-slate-900/40 border-glassborder text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {errorMsg && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                    {errorMsg}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-neonIndigo group"
                >
                  <Play className="h-4 w-4 fill-white group-hover:scale-105 transition-transform" />
                  <span>Generate & Start Quiz</span>
                </button>

              </form>
            )}

          </GlassCard>
        </div>

        {/* Info Column */}
        <div className="space-y-4">
          <GlassCard className="border border-white/5 p-6 h-full flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                <span>AI Parameters</span>
              </h3>
              
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
                <div className="space-y-1">
                  <p className="font-bold text-slate-300">Multiple Choice (MCQ)</p>
                  <p>Includes a single question statement with 4 options, a correct answer, and an AI justification log.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-300">Fill in the Blanks</p>
                  <p>Blanks out structural keywords inside paragraphs of your learning upload.</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-300">True or False</p>
                  <p>Fact-checking statements derived from content, sometimes logically negated by AI.</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/25 flex items-start space-x-2.5 mt-6">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-400/80 leading-normal">
                Generating tests with 15 questions or complex "Short Answers" will process more tokens and may increase server latency.
              </p>
            </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
};

export default QuizSetup;
