import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { 
  Trophy, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Lightbulb, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading || !user?.token) {
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await api.get('/analytics/dashboard', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Could not load learning metrics. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [authLoading, user]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  // Handle empty state
  const hasHistory = data && data.totalQuizzesTaken > 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-up">
      
      {/* Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
            Learning Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your progress, generate quizzes, and check AI-powered recommendations.
          </p>
        </div>
        <Link 
          to="/upload" 
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-neonIndigo transition-all active:translate-y-0.5 self-start md:self-auto"
        >
          + Upload Materials
        </Link>
      </div>

      {!hasHistory ? (
        /* Empty State */
        <GlassCard className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-glassborder min-h-[400px]">
          <div className="h-16 w-16 bg-indigo-600/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-200">Start Your Learning Journey</h2>
          <p className="text-slate-400 max-w-md mt-2 mb-8 text-sm">
            You haven't uploaded any study materials or taken any quizzes yet. Upload a PDF, image, audio, or video, and our AI will immediately build personalized practice tests.
          </p>
          <Link
            to="/upload"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-neonIndigo transition-all"
          >
            Upload Your First Document
          </Link>
        </GlassCard>
      ) : (
        /* Real Dashboard Content */
        <>
          {/* Top stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Stat: Total Quizzes */}
            <GlassCard hoverable className="flex items-center space-x-4 border border-white/5">
              <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Quizzes Taken</p>
                <h3 className="text-2xl font-bold text-slate-100 mt-0.5">{data.totalQuizzesTaken}</h3>
              </div>
            </GlassCard>

            {/* Stat: Average Score */}
            <GlassCard hoverable className="flex items-center space-x-4 border border-white/5">
              <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Average Score</p>
                <h3 className="text-2xl font-bold text-slate-100 mt-0.5">{data.averageScore}%</h3>
              </div>
            </GlassCard>

            {/* Stat: Highest Score */}
            <GlassCard hoverable className="flex items-center space-x-4 border border-white/5">
              <div className="p-3 bg-amber-600/10 text-amber-400 rounded-xl">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Highest Score</p>
                <h3 className="text-2xl font-bold text-slate-100 mt-0.5">{data.highestScore}%</h3>
              </div>
            </GlassCard>

            {/* Stat: Improvement */}
            <GlassCard hoverable className="flex items-center space-x-4 border border-white/5">
              <div className="p-3 bg-rose-600/10 text-rose-400 rounded-xl">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Overall Change</p>
                <h3 className={`text-2xl font-bold mt-0.5 ${data.improvementPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data.improvementPercentage >= 0 ? `+${data.improvementPercentage}%` : `${data.improvementPercentage}%`}
                </h3>
              </div>
            </GlassCard>

          </div>

          {/* AI Feedback Alert Banner */}
          {data.recommendations && (
            <GlassCard className="border border-indigo-500/20 bg-indigo-600/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-400 pointer-events-none">
                <Lightbulb className="h-32 w-32" />
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg shrink-0">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-slate-200">AI Learning Feedback</h4>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
                    {data.recommendations.suggestions && data.recommendations.suggestions[0] || 
                     "Great job continuing your tests. We recommend focusing on your weak topics listed below."}
                  </p>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 mt-2">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Recommended Daily Study Time: {data.recommendations.recommendedStudyTime} minutes</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Charts & Subject Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Weekly/Monthly Progress Chart */}
            <GlassCard className="lg:col-span-2 border border-white/5 flex flex-col justify-between h-[360px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-200">Learning Progress</h3>
                <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-md">Historical Scores</span>
              </div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.weeklyProgress && data.weeklyProgress.length > 0 ? data.weeklyProgress : data.monthlyProgress}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.14)" />
                    <XAxis 
                      dataKey={data.weeklyProgress && data.weeklyProgress.length > 0 ? "week" : "month"} 
                      stroke="#94A3B8" 
                      fontSize={11}
                    />
                    <YAxis 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#151D33', 
                        borderColor: '#273449',
                        borderRadius: '0.5rem',
                        color: '#f8fafc' 
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="average" 
                      stroke="#7C3AED" 
                      strokeWidth={3}
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* Strong vs Weak Topics Card */}
            <GlassCard className="border border-white/5 flex flex-col justify-between h-[360px] overflow-hidden">
              <div>
                <h3 className="text-lg font-bold text-slate-200 mb-4">Topic Strengths</h3>
                
                {/* Weak Topics */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400 tracking-wide uppercase">
                    <AlertCircle className="h-4 w-4" />
                    <span>Focus Areas (&lt;60%)</span>
                  </div>
                  {data.weakTopics && data.weakTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {data.weakTopics.map((t, idx) => (
                        <span 
                          key={idx} 
                          className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold"
                        >
                          {t.topic} ({t.average}%)
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic pl-1">No weak topics! Excellent performance.</p>
                  )}
                </div>

                {/* Strong Topics */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 tracking-wide uppercase">
                    <Trophy className="h-4 w-4" />
                    <span>Strong Mastery (&ge;75%)</span>
                  </div>
                  {data.strongTopics && data.strongTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {data.strongTopics.map((t, idx) => (
                        <span 
                          key={idx} 
                          className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold"
                        >
                          {t.topic} ({t.average}%)
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic pl-1">Keep practice going to lock in masteries.</p>
                  )}
                </div>
              </div>

              <Link 
                to="/analytics" 
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center justify-end mt-4 group"
              >
                <span>Full Chart Breakdown</span>
                <ChevronRight className="h-4 w-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </GlassCard>

          </div>

          {/* Recent Quiz Attempts List */}
          <GlassCard className="border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-200">Recent Quiz History</h3>
              <Link 
                to="/history" 
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center group"
              >
                <span>View Full History</span>
                <ChevronRight className="h-4 w-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900/40 border-b border-glassborder">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Quiz Topic</th>
                    <th className="py-3 px-4 font-semibold">Date Completed</th>
                    <th className="py-3 px-4 font-semibold">Difficulty</th>
                    <th className="py-3 px-4 font-semibold text-center">Score</th>
                    <th className="py-3 px-4 text-center font-semibold">Percentage</th>
                    <th className="py-3 px-4 text-center font-semibold">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glassborder bg-slate-900/10">
                  {data.recentQuizzes.map((result) => (
                    <tr key={result._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{result.topic}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(result.date).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-xs capitalize">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          result.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' :
                          result.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                        }`}>
                          {result.difficulty}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold">{result.score} / {result.totalQuestions}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-bold text-sm ${
                          result.percentage >= 75 ? 'text-emerald-400' :
                          result.percentage >= 50 ? 'text-amber-400' :
                          'text-rose-400'
                        }`}>
                          {result.percentage}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs">
                        {result.improvementPercentage !== undefined && (
                          <span className={`font-semibold ${
                            result.improvementPercentage > 0 ? 'text-emerald-400' :
                            result.improvementPercentage < 0 ? 'text-rose-400' :
                            'text-slate-400'
                          }`}>
                            {result.improvementPercentage > 0 ? `+${result.improvementPercentage}%` :
                             result.improvementPercentage < 0 ? `${result.improvementPercentage}%` :
                             '0%'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </>
      )}

    </div>
  );
};

export default Dashboard;
