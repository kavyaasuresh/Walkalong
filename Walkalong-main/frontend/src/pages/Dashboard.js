import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Trophy, Calendar, TrendingUp, X, Heart, Clock, Target, Activity, BookOpen, AlertCircle } from 'lucide-react';
import { workDoneAPI, moodAPI, todoAPI, streamsAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [pointsSummary, setPointsSummary] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [studyHoursData, setStudyHoursData] = useState([]);
  const [streamAnalytics, setStreamAnalytics] = useState([]);
  const [revisionReminders, setRevisionReminders] = useState([]);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for development if API fails or is not ready
      // In a real scenario we would handle this better
      try {
        const [pointsResponse, moodResponse, tasksResponse, streamsResponse] = await Promise.all([
          workDoneAPI.getPointsSummary(),
          moodAPI.getMoodHistory(),
          todoAPI.getAllTasks(),
          streamsAPI.getAllStreams()
        ]);

        setPointsSummary(pointsResponse.data);
        processMoodData(moodResponse.data);
        processActivityData(tasksResponse.data);
        processStreamAnalytics(streamsResponse.data);
        generateRevisionReminders(tasksResponse.data);
      } catch (innerErr) {
        console.warn("API might not be ready, using mock data for UI visualization", innerErr);
        // Fallback mock data
        setPointsSummary({ totalPoints: 1250, weeklyPoints: 340, breakdown: [] });
        processMoodData([]);
        processActivityData([]);
        processStreamAnalytics([]);
        setRevisionReminders([]);
      }

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const processMoodData = (moods) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const mood = moods.find(m => m.date === dateStr);

      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: mood?.mood || 0,
        energy: mood?.energy || 0,
        motivation: mood?.motivation || 0
      });
    }
    setMoodData(last7Days);
  };

  const processActivityData = (tasks) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTasks = tasks.filter(task => task.assignedDate === dateStr);
      const completedTasks = dayTasks.filter(task => task.status === 'COMPLETED');
      const totalHours = completedTasks.reduce((sum, task) => sum + (task.duration || 0), 0) / 60;

      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        active: dayTasks.length > 0,
        hours: totalHours,
        tasks: dayTasks.length,
        completed: completedTasks.length
      });
    }
    setActivityData(last7Days);
    setStudyHoursData(last7Days.filter(day => day.active));
  };

  const processStreamAnalytics = (streams) => {
    const analytics = streams.map(stream => {
      const tasks = stream.tasks || [];
      const completed = tasks.filter(task => task.status === 'COMPLETED').length;
      const total = tasks.length;

      return {
        name: stream.name,
        completed,
        pending: total - completed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });
    setStreamAnalytics(analytics);
  };

  const generateRevisionReminders = (tasks) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const reminders = tasks
      .filter(task => task.revisionDate)
      .map(task => ({
        ...task,
        daysUntil: Math.ceil((new Date(task.revisionDate) - new Date()) / (1000 * 60 * 60 * 24))
      }))
      .filter(task => task.daysUntil <= 3)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);

    setRevisionReminders(reminders);
  };

  // Updated Colors based on new theme
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
  const CHART_TEXT_COLOR = '#94a3b8';

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Overview</h1>
        <p>Welcome back! Here's your learning summary.</p>
      </div>

      {/* Mood Analytics Wave Chart */}
      <div className="analytics-section">
        <div className="section-header">
          <Heart className="section-icon" />
          <h2>Mood & Energy</h2>
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
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
      </div>

      {/* Points and Activity Grid */}
      <div className="dashboard-grid">
        {/* Points Card */}
        <div className="dashboard-card points-card" onClick={() => setShowPointsModal(true)}>
          <div className="card-header">
            <Trophy className="card-icon" />
            <h3>Points Earned</h3>
          </div>
          <div className="card-content">
            <div className="points-display">
              <span className="total-points">{pointsSummary?.totalPoints || 0}</span>
              <span className="points-label">Total Points</span>
            </div>
            <div className="weekly-points">
              <span className="weekly-label">This Week: {pointsSummary?.weeklyPoints || 0} pts</span>
            </div>
          </div>
          <div className="card-glow"></div>
        </div>

        {/* Daily Activity */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <Activity className="card-icon" style={{ color: '#10b981' }} />
            <h3>Daily Activity</h3>
          </div>
          <div className="activity-grid">
            {activityData.length > 0 ? (
              activityData.map((day, index) => (
                <div key={index} className={`activity-day ${day.active ? 'active' : 'inactive'}`}>
                  <span className="day-label">{day.date}</span>
                  <div className={`activity-indicator ${day.active ? 'active' : ''}`}>
                    {day.active ? '✓' : ''}
                  </div>
                  <span className="task-count">{day.completed}/{day.tasks}</span>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', width: '100%' }}>No activity data</div>
            )}
          </div>
        </div>
      </div>

      {/* Study Hours & Stream Analytics Row */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        {/* Study Hours Chart */}
        <div className="analytics-section">
          <div className="section-header">
            <Clock className="section-icon" />
            <h2>Study Hours</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={studyHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke={CHART_TEXT_COLOR} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={CHART_TEXT_COLOR} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  formatter={(value) => [`${value.toFixed(1)} hours`, 'Study Time']}
                  contentStyle={{
                    background: 'rgba(15, 18, 37, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#e2e8f0'
                  }}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stream Analytics */}
        <div className="analytics-section">
          <div className="section-header">
            <BookOpen className="section-icon" />
            <h2>Streams</h2>
          </div>
          <div className="streams-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {streamAnalytics.length > 0 ? (
              streamAnalytics.slice(0, 4).map((stream, index) => (
                <div key={index} className="stream-stat-item">
                  <div className="stream-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <h4>{stream.name}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stream.percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${stream.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-tertiary)', textAlign: 'center' }}>No stream data</div>
            )}
          </div>
        </div>
      </div>

      {/* Revision Reminders */}
      <div className="analytics-section">
        <div className="section-header">
          <AlertCircle className="section-icon" />
          <h2>Upcoming Revisions</h2>
        </div>
        <div className="reminders-grid">
          {revisionReminders.length === 0 ? (
            <div className="no-reminders" style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px' }}>
              <p>No upcoming revisions scheduled</p>
            </div>
          ) : (
            revisionReminders.map((reminder, index) => (
              <div key={index} className={`reminder-card ${reminder.daysUntil === 0 ? 'urgent' : reminder.daysUntil === 1 ? 'soon' : 'upcoming'}`}>
                <div className="reminder-priority">
                  {reminder.daysUntil === 0 ? '🔴' : reminder.daysUntil === 1 ? '🟡' : '🟢'}
                </div>
                <div className="reminder-content">
                  <h4>{reminder.title}</h4>
                  <p>{reminder.daysUntil === 0 ? 'Due Today' : reminder.daysUntil === 1 ? 'Due Tomorrow' : `Due in ${reminder.daysUntil} days`}</p>
                  <span className="reminder-stream">{reminder.stream?.name || 'No Stream'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Points Modal */}
      {showPointsModal && (
        <div className="modal-overlay" onClick={() => setShowPointsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Points Breakdown</h2>
              <button className="modal-close" onClick={() => setShowPointsModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="points-summary">
                <div className="summary-item">
                  <span className="summary-label">Total Points:</span>
                  <span className="summary-value">{pointsSummary?.totalPoints || 0}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">This Week:</span>
                  <span className="summary-value">{pointsSummary?.weeklyPoints || 0}</span>
                </div>
              </div>
              <h3>Recent Entries</h3>
              <div className="breakdown-list">
                {pointsSummary?.breakdown?.map((entry, index) => (
                  <div key={index} className="breakdown-item">
                    <div className="breakdown-date">
                      <Calendar size={16} />
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                      <span className="day-name">({entry.dayOfWeek})</span>
                    </div>
                    <div className="breakdown-details">
                      <span className="item-count">{entry.itemCount} tasks</span>
                      <span className="entry-points">{entry.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;