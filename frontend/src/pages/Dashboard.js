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

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Student Analytics Dashboard</h1>
        <p>Track your learning progress and performance</p>
      </div>

      {/* Mood Analytics Wave Chart */}
      <div className="analytics-section">
        <div className="section-header">
          <Heart className="section-icon" />
          <h2>Mood Analytics</h2>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis domain={[0, 5]} stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area type="monotone" dataKey="mood" stackId="1" stroke="#ef4444" fill="#ef444420" />
              <Area type="monotone" dataKey="energy" stackId="2" stroke="#3b82f6" fill="#3b82f620" />
              <Area type="monotone" dataKey="motivation" stackId="3" stroke="#8b5cf6" fill="#8b5cf620" />
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
              <span className="weekly-label">This Week: {pointsSummary?.weeklyPoints || 0}</span>
            </div>
          </div>
        </div>

        {/* Daily Activity */}
        <div className="dashboard-card activity-card">
          <div className="card-header">
            <Activity className="card-icon" />
            <h3>Daily Activity</h3>
          </div>
          <div className="activity-grid">
            {activityData.map((day, index) => (
              <div key={index} className={`activity-day ${day.active ? 'active' : 'inactive'}`}>
                <span className="day-label">{day.date}</span>
                <div className={`activity-indicator ${day.active ? 'active' : ''}`}>
                  {day.active ? '✓' : '○'}
                </div>
                <span className="task-count">{day.completed}/{day.tasks}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Study Hours Chart */}
      <div className="analytics-section">
        <div className="section-header">
          <Clock className="section-icon" />
          <h2>Study Hours Analysis</h2>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={studyHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(1)} hours`, 'Study Time']}
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="hours" fill="#667eea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stream Analytics */}
      <div className="analytics-section">
        <div className="section-header">
          <BookOpen className="section-icon" />
          <h2>Stream-wise Performance</h2>
        </div>
        <div className="stream-analytics-grid">
          <div className="pie-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={streamAnalytics}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="completed"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {streamAnalytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="stream-stats">
            {streamAnalytics.map((stream, index) => (
              <div key={index} className="stream-stat-item">
                <div className="stream-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <div className="stream-info">
                  <h4>{stream.name}</h4>
                  <div className="stream-progress">
                    <span>{stream.completed}/{stream.total} completed</span>
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
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revision Reminders */}
      <div className="analytics-section">
        <div className="section-header">
          <AlertCircle className="section-icon" />
          <h2>Revision Reminders</h2>
        </div>
        <div className="reminders-grid">
          {revisionReminders.length === 0 ? (
            <div className="no-reminders">
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

      {/* Performance Insights */}
      <div className="analytics-section">
        <div className="section-header">
          <TrendingUp className="section-icon" />
          <h2>Performance Insights</h2>
        </div>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Most Productive Day</h4>
            <p>{activityData.reduce((max, day) => day.hours > max.hours ? day : max, activityData[0])?.date || 'N/A'}</p>
          </div>
          <div className="insight-card">
            <h4>Average Study Time</h4>
            <p>{(studyHoursData.reduce((sum, day) => sum + day.hours, 0) / Math.max(studyHoursData.length, 1)).toFixed(1)}h/day</p>
          </div>
          <div className="insight-card">
            <h4>Completion Rate</h4>
            <p>{Math.round((activityData.reduce((sum, day) => sum + day.completed, 0) / Math.max(activityData.reduce((sum, day) => sum + day.tasks, 0), 1)) * 100)}%</p>
          </div>
          <div className="insight-card">
            <h4>Active Days</h4>
            <p>{activityData.filter(day => day.active).length}/7 days</p>
          </div>
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