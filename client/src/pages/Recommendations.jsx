import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const RecommendationsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/analytics/dashboard');
        setData(response.data);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setErrorMsg('Failed to load study recommendations.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {errorMsg}
        </div>
      </div>
    );
  }

  const { recommendations, weakTopics, strongTopics } = data;

  const hasRecommendations = (weakTopics && weakTopics.length > 0) || (recommendations && recommendations.suggestions.length > 0);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto animate-fade-up">
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans flex items-center space-x-2">
          <span>Personalized Study Plan</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Smart learning paths formulated by AI matching your correct answers, weaknesses, and quiz history.
        </p>
      </div>

      {!hasRecommendations ? (
        <GlassCard className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-glassborder min-h-[300px]">
          <CheckCircle className="h-12 w-12 text-emerald-400 mb-4" />
          <h2 className="text-lg font-bold text-slate-200">All Topics Mastered!</h2>
          <p className="text-slate-400 text-xs mt-1 mb-6">You have no weak topics registered. Keep up the great work!</p>
          <Link to="/upload" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-neonIndigo">
            Upload More Materials
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Plan Column */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Weak Topics Focus List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <span>Priority Focus Areas</span>
              </h3>

              <div className="space-y-4">
                {weakTopics && weakTopics.length > 0 ? (
                  weakTopics.map((w, idx) => (
                    <GlassCard key={idx} className="border border-rose-500/10 bg-rose-500/5 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-slate-200">{w.topic}</h4>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">
                          Average: {w.average}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-normal">
                        Your average score is below the threshold of 60%. We recommend generating a targeted 5-question quiz on <span className="font-semibold text-slate-200">{w.topic}</span> at <span className="text-emerald-400 font-semibold">Easy</span> difficulty to rebuild confidence.
                      </p>
                      <div className="pt-2 border-t border-glassborder/50 flex justify-end">
                        <Link 
                          to="/upload" 
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center group"
                        >
                          <span>Generate Targeted Practice</span>
                          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </GlassCard>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No weak topics! All concepts scoring &ge;60%.</p>
                )}
              </div>
            </div>

            {/* Action Suggestions */}
            {recommendations && recommendations.suggestions && recommendations.suggestions.length > 0 && (
              <GlassCard className="border border-white/5 p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-indigo-400" />
                  <span>AI Recommended Action Steps</span>
                </h3>
                <ul className="space-y-3">
                  {recommendations.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start space-x-3 text-xs text-slate-300 leading-relaxed">
                      <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-500/10 text-[10px] font-bold text-indigo-400 shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

          </div>

          {/* Target Study Timing Card Column */}
          <div className="space-y-4">
            <GlassCard className="border border-white/5 p-6 space-y-6">
              <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                <span>Daily Practice target</span>
              </h3>

              <div className="text-center py-4 border-b border-glassborder">
                <span className="text-5xl font-black text-indigo-400">
                  {recommendations?.recommendedStudyTime || 30}
                </span>
                <span className="text-sm font-bold text-slate-400 block mt-2">Minutes per day</span>
              </div>

              <div className="space-y-4 text-xs text-slate-400 leading-normal">
                <div className="flex items-start space-x-2.5">
                  <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p>Daily focus of {recommendations?.recommendedStudyTime || 30} minutes helps convert weak focus areas into stable masteries within 1 week.</p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p>Spaced-repetition: Generating another quiz tomorrow boosts long-term concept recall by up to 40%.</p>
                </div>
              </div>
            </GlassCard>

            {/* Mastered topics card */}
            {strongTopics && strongTopics.length > 0 && (
              <GlassCard className="border border-white/5 p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Mastered Concepts (&ge;75%)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {strongTopics.map((s, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold"
                    >
                      {s.topic}
                    </span>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default RecommendationsPage;
