import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Sparkles, 
  Files, 
  HelpCircle, 
  Users, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';

const COLORS = ['#7C3AED', '#22C55E', '#F59E0B', '#EF4444', '#A78BFA', '#2563EB'];

const AIUsage = () => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await api.get('/analytics/admin/usage');
        setUsage(response.data);
      } catch (err) {
        console.error('Error fetching admin usage:', err);
        setErrorMsg('Failed to query system usage statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
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

  const { 
    totalUsers, 
    totalFilesUploaded, 
    totalQuizzesGenerated, 
    fileTypeDistribution, 
    aiIntegrationStatus 
  } = usage;

  // Format chart distribution data
  const chartData = fileTypeDistribution.map((item) => ({
    name: item._id ? item._id.split('/')[1] || item._id : 'unknown',
    value: item.count
  }));

  const hasChartData = chartData.length > 0;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-fade-up">
      
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 font-sans flex items-center space-x-2">
          <span>AI & System Monitor</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor LLM integrations, document uploads, API token stats, and global resource load.
        </p>
      </div>

      {/* Global Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <GlassCard className="border border-white/5 flex items-center space-x-4">
          <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-0.5">{totalUsers}</h3>
          </div>
        </GlassCard>

        <GlassCard className="border border-white/5 flex items-center space-x-4">
          <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl">
            <Files className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Uploads</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-0.5">{totalFilesUploaded}</h3>
          </div>
        </GlassCard>

        <GlassCard className="border border-white/5 flex items-center space-x-4">
          <div className="p-3 bg-amber-600/10 text-amber-400 rounded-xl">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Quizzes Generated</p>
            <h3 className="text-2xl font-bold text-slate-100 mt-0.5">{totalQuizzesGenerated}</h3>
          </div>
        </GlassCard>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* API integration checker */}
        <GlassCard className="border border-white/5 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-indigo-400" />
              <span>AI Integration Status</span>
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              AuraQuiz loads configurations from `.env` on bootstrap. Below are the verified API status checkers for LLM operations.
            </p>

            <div className="space-y-3 pt-2">
              {/* Gemini API Key Status */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-glassborder">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/15 flex items-center justify-center font-bold text-indigo-400 text-xs">
                    G
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Google Gemini API Key</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Primary model: gemini-1.5-flash</p>
                  </div>
                </div>
                <div>
                  {aiIntegrationStatus.geminiActive ? (
                    <span className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/25 rounded-lg">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center text-slate-500 text-xs font-bold bg-slate-800/40 px-2.5 py-1 border border-glassborder rounded-lg">
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Not Configured
                    </span>
                  )}
                </div>
              </div>

              {/* OpenAI API Key Status */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-glassborder">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/15 flex items-center justify-center font-bold text-indigo-400 text-xs">
                    O
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">OpenAI API Key</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Secondary model: gpt-4o-mini</p>
                  </div>
                </div>
                <div>
                  {aiIntegrationStatus.openAIActive ? (
                    <span className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/25 rounded-lg">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center text-slate-500 text-xs font-bold bg-slate-800/40 px-2.5 py-1 border border-glassborder rounded-lg">
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Not Configured
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-[10px] text-indigo-400 leading-normal mt-4">
            Note: If both keys are missing, the server will switch to the dynamic mock parsing algorithm. This runs locally without internet requirements.
          </div>
        </GlassCard>

        {/* File distribution chart */}
        <GlassCard className="border border-white/5 p-6 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <span>Document Types Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Comparison ratios of different document MIME uploads.</p>
          </div>

          {!hasChartData ? (
            <p className="text-center text-xs text-slate-500 py-16">No document distributions to show.</p>
          ) : (
            <div className="w-full h-56 pt-4 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#151D33', 
                      borderColor: '#273449',
                      borderRadius: '0.5rem',
                      color: '#f8fafc' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {hasChartData && (
            <div className="flex flex-wrap justify-center gap-3 text-[10px] pt-4 border-t border-glassborder">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-1 font-semibold">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-slate-400 capitalize">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

      </div>

    </div>
  );
};

export default AIUsage;
