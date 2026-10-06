import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import {
  Trophy,
  Target,
  ShieldCheck,
  Activity,
  AlertCircle
} from 'lucide-react';

const COLORS = [
  '#22C55E',
  '#EF4444',
  '#2563EB',
  '#7C3AED',
  '#F59E0B'
];

const AnalyticsPage = () => {

  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {

    const fetchCharts = async () => {

      try {

        const response = await api.get('/analytics/charts');

        setChartData(response.data);

      } catch (err) {

        console.error('Error fetching chart stats:', err);

        setErrorMsg(
          'Failed to fetch analytics statistics data.'
        );

      } finally {

        setLoading(false);

      }

    };

    fetchCharts();

  }, []);


  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">

        <div
          className="
            h-8
            w-8
            border-4
            border-indigo-500
            border-t-transparent
            rounded-full
            animate-spin
          "
        ></div>

      </div>
    );

  }


  /* =========================
     ERROR
  ========================= */

  if (errorMsg) {

    return (
      <div className="p-6">

        <div
          className="
            p-4
            rounded-xl
            bg-red-500/10
            border
            border-red-500/20
            text-red-300
          "
        >
          {errorMsg}
        </div>

      </div>
    );

  }


  const {
    topicPerformance,
    questionDistribution,
    skillComparison
  } = chartData;


  const hasData =
    topicPerformance &&
    topicPerformance.length > 0;


  return (

    <div
      className="
        p-6
        space-y-6
        max-w-7xl
        mx-auto
        animate-fade-up
      "
    >


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div>

        <h1
          className="
            text-3xl
            font-extrabold
            tracking-tight
            text-slate-100
            font-sans
          "
        >
          Performance Analytics
        </h1>

        <p className="text-sm text-slate-400 mt-1">

          Detailed cognitive visualizers representing accuracy
          rates, velocity indicators, and topic strength
          distributions.

        </p>

      </div>


      {/* =====================================================
          NO DATA
      ===================================================== */}

      {!hasData ? (

        <GlassCard
          className="
            flex
            flex-col
            items-center
            justify-center
            text-center
            p-12
            border
            border-dashed
            border-glassborder
            min-h-[300px]
          "
        >

          <AlertCircle
            className="h-10 w-10 text-indigo-300 mb-4"
          />

          <h2 className="text-lg font-bold text-slate-100">

            No Analytics Found

          </h2>

          <p className="text-slate-400 text-xs mt-1">

            Please complete at least one quiz to render
            learning competency charts.

          </p>

        </GlassCard>

      ) : (

        <div className="space-y-6">


          {/* =====================================================
              TOP CHARTS
          ===================================================== */}

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-3
              gap-6
            "
          >


            {/* =================================================
                BAR CHART
            ================================================= */}

            <GlassCard
              className="
                lg:col-span-2
                border
                border-white/5
                h-[380px]
                flex
                flex-col
                justify-between
              "
            >

              <div>

                <h3 className="text-base font-bold text-slate-100">

                  Topic Competency Breakdown

                </h3>

                <p className="text-[10px] text-slate-400 mt-0.5">

                  Average score vs highest score across
                  identified learning categories.

                </p>

              </div>


              <div className="w-full h-72 pt-4">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={topicPerformance}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 0
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(148, 163, 184, 0.14)"
                    />

                    <XAxis
                      dataKey="topic"
                      stroke="#94A3B8"
                      fontSize={10}
                      tickLine={false}
                    />

                    <YAxis
                      stroke="#94A3B8"
                      fontSize={10}
                      domain={[0, 100]}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#151D33',
                        borderColor: '#273449',
                        borderRadius: '0.5rem',
                        color: '#F8FAFC'
                      }}
                    />

                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconSize={10}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: 11,
                        color: '#CBD5E1'
                      }}
                    />

                    <Bar
                      name="Average Score %"
                      dataKey="averageScore"
                      fill="#7C3AED"
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      name="Highest Score %"
                      dataKey="highestScore"
                      fill="#22C55E"
                      radius={[4, 4, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </GlassCard>


            {/* =================================================
                PIE CHART
            ================================================= */}

            <GlassCard
              className="
                border
                border-white/5
                h-[380px]
                flex
                flex-col
                justify-between
              "
            >

              <div>

                <h3 className="text-base font-bold text-slate-100">

                  Cumulative Accuracy Rate

                </h3>

                <p className="text-[10px] text-slate-400 mt-0.5">

                  Total count of correct vs wrong answers
                  completed.

                </p>

              </div>


              <div
                className="
                  w-full
                  h-64
                  relative
                  flex
                  items-center
                  justify-center
                "
              >

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={questionDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >

                      {questionDistribution.map(
                        (entry, index) => (

                          <Cell
                            key={`cell-${index}`}
                            fill={
                              COLORS[
                                index % COLORS.length
                              ]
                            }
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#151D33',
                        borderColor: '#273449',
                        borderRadius: '0.5rem',
                        color: '#F8FAFC'
                      }}
                    />

                  </PieChart>

                </ResponsiveContainer>


                {/* CENTER ACCURACY */}

                <div
                  className="
                    absolute
                    inset-0
                    m-auto
                    flex
                    flex-col
                    items-center
                    justify-center
                    h-20
                    w-20
                  "
                >

                  <span
                    className="
                      text-2xl
                      font-black
                      text-slate-100
                    "
                  >

                    {Math.round(
                      (
                        questionDistribution[0].value /
                        (
                          questionDistribution[0].value +
                          questionDistribution[1].value
                        )
                      ) * 100
                    ) || 0}%

                  </span>

                  <span
                    className="
                      text-[8px]
                      text-slate-400
                      uppercase
                      font-bold
                      tracking-wider
                    "
                  >

                    Accuracy

                  </span>

                </div>

              </div>


              {/* PIE LEGEND */}

              <div
                className="
                  flex
                  justify-center
                  space-x-6
                  pb-2
                  text-xs
                "
              >

                <div className="flex items-center space-x-1.5">

                  <div
                    className="
                      h-3
                      w-3
                      rounded-full
                      bg-emerald-500
                    "
                  ></div>

                  <span className="text-slate-300 font-semibold">

                    Correct ({questionDistribution[0].value})

                  </span>

                </div>


                <div className="flex items-center space-x-1.5">

                  <div
                    className="
                      h-3
                      w-3
                      rounded-full
                      bg-red-500
                    "
                  ></div>

                  <span className="text-slate-300 font-semibold">

                    Incorrect ({questionDistribution[1].value})

                  </span>

                </div>

              </div>

            </GlassCard>

          </div>


          {/* =====================================================
              NEW LINE GRAPH
          ===================================================== */}

          <GlassCard
            className="
              border
              border-white/5
              h-[400px]
              flex
              flex-col
              justify-between
            "
          >

            <div>

              <h3 className="text-base font-bold text-slate-100">

                Performance Trend

              </h3>

              <p className="text-[10px] text-slate-400 mt-0.5">

                Comparison of average and highest scores
                across learning topics.

              </p>

            </div>


            <div className="w-full h-80 pt-4">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={topicPerformance}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 10
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.14)"
                  />

                  <XAxis
                    dataKey="topic"
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                  />

                  <YAxis
                    stroke="#94A3B8"
                    fontSize={10}
                    domain={[0, 100]}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151D33',
                      borderColor: '#273449',
                      borderRadius: '0.5rem',
                      color: '#F8FAFC'
                    }}
                  />

                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{
                      fontSize: 11,
                      color: '#CBD5E1'
                    }}
                  />


                  {/* AVERAGE SCORE LINE */}

                  <Line
                    type="monotone"
                    dataKey="averageScore"
                    name="Average Score %"
                    stroke="#7C3AED"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: '#7C3AED'
                    }}
                    activeDot={{
                      r: 7
                    }}
                  />


                  {/* HIGHEST SCORE LINE */}

                  <Line
                    type="monotone"
                    dataKey="highestScore"
                    name="Highest Score %"
                    stroke="#22C55E"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: '#22C55E'
                    }}
                    activeDot={{
                      r: 7
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </GlassCard>


          {/* =====================================================
              BOTTOM SECTION
          ===================================================== */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
              gap-6
            "
          >


            {/* =================================================
                RADAR CHART
            ================================================= */}

            <GlassCard
              className="
                border
                border-white/5
                h-[380px]
                flex
                flex-col
                justify-between
              "
            >

              <div>

                <h3 className="text-base font-bold text-slate-100">

                  Skill Competency Map

                </h3>

                <p className="text-[10px] text-slate-400 mt-0.5">

                  Vector profile grading logic along
                  cognitive metrics.

                </p>

              </div>


              <div className="w-full h-72 pt-2">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    data={skillComparison}
                  >

                    <PolarGrid
                      stroke="rgba(148, 163, 184, 0.14)"
                    />

                    <PolarAngleAxis
                      dataKey="subject"
                      stroke="#94A3B8"
                      fontSize={9}
                    />

                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      stroke="#94A3B8"
                      fontSize={8}
                    />

                    <Radar
                      name="Competency"
                      dataKey="A"
                      stroke="#A78BFA"
                      fill="#A78BFA"
                      fillOpacity={0.25}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#151D33',
                        borderColor: '#273449',
                        borderRadius: '0.5rem',
                        color: '#F8FAFC'
                      }}
                    />

                  </RadarChart>

                </ResponsiveContainer>

              </div>

            </GlassCard>


            {/* =================================================
                PERFORMANCE INDICATORS
            ================================================= */}

            <div
              className="
                md:col-span-2
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              "
            >


              {/* QUIZ CONSISTENCY */}

              <GlassCard
                className="
                  border
                  border-white/5
                  flex
                  flex-col
                  justify-between
                  p-6
                "
              >

                <div className="flex items-center space-x-3">

                  <div
                    className="
                      p-2.5
                      bg-indigo-500/10
                      text-indigo-400
                      rounded-xl
                    "
                  >

                    <Target className="h-5 w-5" />

                  </div>

                  <div>

                    <h4 className="text-sm font-bold text-slate-100">

                      Quiz Consistency

                    </h4>

                    <p className="text-[10px] text-slate-400">

                      Regular practice tracking indicator.

                    </p>

                  </div>

                </div>


                <div className="mt-4">

                  <span
                    className="
                      text-4xl
                      font-black
                      text-slate-100
                    "
                  >

                    {topicPerformance.length}

                  </span>

                  <span
                    className="
                      text-xs
                      text-slate-400
                      font-semibold
                      ml-2
                    "
                  >

                    topics practiced

                  </span>

                </div>


                <p
                  className="
                    text-[10px]
                    text-slate-400
                    leading-normal
                    mt-3
                  "
                >

                  Practicing multiple topics allows the
                  recommendation algorithm to build detailed
                  focus-profiles and accurate study plan templates.

                </p>

              </GlassCard>


              {/* MAXIMUM RETENTION */}

              <GlassCard
                className="
                  border
                  border-white/5
                  flex
                  flex-col
                  justify-between
                  p-6
                "
              >

                <div className="flex items-center space-x-3">

                  <div
                    className="
                      p-2.5
                      bg-emerald-500/10
                      text-emerald-400
                      rounded-xl
                    "
                  >

                    <ShieldCheck className="h-5 w-5" />

                  </div>

                  <div>

                    <h4 className="text-sm font-bold text-slate-100">

                      Maximum Retention

                    </h4>

                    <p className="text-[10px] text-slate-400">

                      Highest score peak registered.

                    </p>

                  </div>

                </div>


                <div className="mt-4">

                  <span
                    className="
                      text-4xl
                      font-black
                      text-emerald-400
                    "
                  >

                    {Math.max(
                      ...topicPerformance.map(
                        t => t.highestScore
                      )
                    )}%

                  </span>

                  <span
                    className="
                      text-xs
                      text-slate-400
                      font-semibold
                      ml-2
                    "
                  >

                    max performance

                  </span>

                </div>


                <p
                  className="
                    text-[10px]
                    text-slate-400
                    leading-normal
                    mt-3
                  "
                >

                  High scores represent strong concept retention.
                  The system considers scores &ge;75% as topic
                  masteries that require less frequent practice.

                </p>

              </GlassCard>


              {/* AI RECOMMENDATION */}

              <GlassCard
                className="
                  border
                  border-white/5
                  flex
                  flex-col
                  justify-between
                  p-6
                  sm:col-span-2
                "
              >

                <div className="flex items-center space-x-3">

                  <div
                    className="
                      p-2.5
                      bg-violet-500/10
                      text-violet-400
                      rounded-xl
                    "
                  >

                    <Activity className="h-5 w-5" />

                  </div>

                  <div>

                    <h4 className="text-sm font-bold text-slate-100">

                      AI Recommendation Status

                    </h4>

                    <p className="text-[10px] text-slate-400">

                      Realtime model tracking.

                    </p>

                  </div>

                </div>


                <p
                  className="
                    text-xs
                    text-slate-300
                    leading-relaxed
                    mt-4
                  "
                >

                  Based on your skill vectors, your learning
                  velocity rating is{' '}

                  <span className="font-bold text-indigo-300">

                    Optimal

                  </span>.

                  Your weak focus points represent exception
                  scenarios. Visit the Recommendations tab to
                  plan your next session.

                </p>

              </GlassCard>

            </div>

          </div>

        </div>

      )}

    </div>

  );
};

export default AnalyticsPage;