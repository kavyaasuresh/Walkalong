import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import {
  TrendingUp, Clock, Calendar, Search,
  ArrowUpRight, ArrowDownRight, Activity, Zap, CheckCircle
} from 'lucide-react';
import { moodAPI, streamsAPI, workDoneAPI, todoAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [moodData, setMoodData] = useState([]);
  const [streams, setStreams] = useState([]);
  const [selectedStreamId, setSelectedStreamId] = useState('all');
  const [streamAnalytics, setStreamAnalytics] = useState({ completed: 0, pending: 0, skipped: 0 });
  const [studyData, setStudyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Color Palette
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
  const CHART_TEXT_COLOR = '#94a3b8';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moodRes, streamsRes, workRes, todoRes] = await Promise.all([
          moodAPI.getMoodHistory(),
          streamsAPI.getAllStreams(),
          workDoneAPI.getAllEntries(),
          todoAPI.getAllTasks()
        ]);

        if (moodRes.data) {
          // Process mood data for chart
          const processedMood = moodRes.data.slice(0, 7).map(entry => ({
            date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
            mood: entry.mood,
            energy: entry.energy
          })).reverse();
          setMoodData(processedMood);
        }

        setStreams(streamsRes.data || []);

        // Process Study Hours (Work Done Points as proxy for now, or actual hours if available)
        // Mocking study hours for better visualization as "Bar Chart" requested
        const mockStudyData = [
          { day: 'Mon', hours: 4 },
          { day: 'Tue', hours: 5.5 },
          { day: 'Wed', hours: 3 },
          { day: 'Thu', hours: 6 },
          { day: 'Fri', hours: 4.5 },
          { day: 'Sat', hours: 7 },
          { day: 'Sun', hours: 2 }
        ];
        setStudyData(mockStudyData);

        // Initial Analytics Calculation
        calculateStreamAnalytics('all', todoRes.data || []);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set mock data on error for display
        setStudyData([
          { day: 'Mon', hours: 4 }, { day: 'Tue', hours: 5.5 }, { day: 'Wed', hours: 3 },
          { day: 'Thu', hours: 6 }, { day: 'Fri', hours: 4.5 }, { day: 'Sat', hours: 7 },
          { day: 'Sun', hours: 2 }
        ]);
        setStreams([{ id: 1, name: 'Study' }, { id: 2, name: 'Project' }]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateStreamAnalytics = async (streamId = 'all', tasks = []) => {
    // If we don't have tasks passed in, we might need to fetch them
    // For now, assuming we fetched all tasks in initial load. 
    // In a real app, might want to store allTasks in state or fetch specific stream metrics.

    try {
      let tasksToAnalyze = tasks;
      if (tasks.length === 0) {
        const res = await todoAPI.getAllTasks();
        tasksToAnalyze = res.data;
      }

      if (streamId !== 'all') {
        tasksToAnalyze = tasksToAnalyze.filter(t => t.stream && t.stream.id.toString() === streamId.toString());
      }

      const completed = tasksToAnalyze.filter(t => t.status === 'COMPLETED').length;
      const pending = tasksToAnalyze.filter(t => t.status === 'PENDING').length;
      const skipped = tasksToAnalyze.filter(t => t.status === 'SKIPPED').length;

      setStreamAnalytics({
        completed, pending, skipped
      });

    } catch (e) {
      console.error("Error calculating analytics", e);
    }
  };

  const handleStreamChange = (e) => {
    const id = e.target.value;
    setSelectedStreamId(id);
    calculateStreamAnalytics(id);
  };

  const pieData = [
    { name: 'Completed', value: streamAnalytics.completed },
    { name: 'Pending', value: streamAnalytics.pending },
    { name: 'Skipped', value: streamAnalytics.skipped }
  ].filter(d => d.value > 0);

  // If empty, show placeholder
  const finalPieData = pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }];

  if (loading) {
    return (
      <div className="dashboard-container loading">
        <div className="loader"></div>
        <p>Loading your personal dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, <span className="text-gradient">Explorer</span></h1>
          <p>Here's what's happening with your projects today.</p>
        </div>
        <div className="header-actions">
          <button className="icon-btn glass-btn">
            <Search size={20} />
          </button>
          <button className="icon-btn glass-btn">
            <Calendar size={20} />
          </button>
          <div className="user-avatar">
            <img src="https://ui-avatars.com/api/?name=Explorer&background=6366f1&color=fff" alt="User" />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid">

        {/* Stream Analytics Section (New) */}
        <section className="glass-card stream-analytics-card">
          <div className="card-header">
            <div>
              <h3>Stream Analytics</h3>
              <p>Task completion by stream</p>
            </div>
            <select
              className="stream-select"
              value={selectedStreamId}
              onChange={handleStreamChange}
            >
              <option value="all">All Streams</option>
              {streams.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {finalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'No Data' ? '#334155' : COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 18, 37, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    color: '#e2e8f0'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Study Hours Section (Updated to BarChart) */}
        <section className="glass-card chart-card">
          <div className="card-header">
            <div>
              <h3>Study Hours</h3>
              <p>Weekly focus time distribution</p>
            </div>
            <div className="card-actions">
              <button className="glass-btn-xs active">Week</button>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke={CHART_TEXT_COLOR}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke={CHART_TEXT_COLOR}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    background: 'rgba(15, 18, 37, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    color: '#e2e8f0'
                  }}
                />
                <Bar
                  dataKey="hours"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                >
                  {studyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Mood Section (Existing) */}
        <section className="glass-card chart-card">
          <div className="card-header">
            <div>
              <h3>Mood & Energy</h3>
              <p>Tracking your wellness trends</p>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={moodData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke={CHART_TEXT_COLOR} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 5]} stroke={CHART_TEXT_COLOR} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 18, 37, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    color: '#e2e8f0'
                  }}
                />
                <Area type="monotone" dataKey="mood" stackId="1" stroke="#ec4899" fill="url(#colorMood)" strokeWidth={2} />
                <Area type="monotone" dataKey="energy" stackId="2" stroke="#6366f1" fill="url(#colorEnergy)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Dashboard;