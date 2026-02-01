import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Target, BarChart3, ChevronLeft, ChevronRight, Layers, LayoutGrid, List } from 'lucide-react';
import { viewPlanAPI } from '../services/api';
import './ViewPlanPage.css';

const ViewPlanPage = () => {
  const [dailyTasks, setDailyTasks] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [monthlyTasks, setMonthlyTasks] = useState([]);
  const [dates, setDates] = useState({
    daily: new Date().toISOString().split('T')[0],
    weekly: new Date().toISOString().split('T')[0],
    monthly: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('time'); // 'time' or 'stream'

  useEffect(() => {
    fetchAllPlans();
  }, [dates]);

  const fetchAllPlans = async () => {
    try {
      setLoading(true);
      // In a real app, these would utilize the date parameters.
      // For this refactor, we are keeping logic similar to existing but ensuring robustness
      const [dailyResponse, weeklyResponse, monthlyResponse] = await Promise.all([
        viewPlanAPI.getDailyPlan(dates.daily),
        viewPlanAPI.getWeeklyPlan(dates.weekly),
        viewPlanAPI.getMonthlyPlan(dates.monthly)
      ]);

      setDailyTasks(dailyResponse.data || []);
      setWeeklyTasks(weeklyResponse.data || []);
      setMonthlyTasks(monthlyResponse.data || []);
    } catch (err) {
      setError('Failed to load plans');
      console.error('Failed to fetch plans:', err);
      // Fallback
      setDailyTasks([]);
      setWeeklyTasks([]);
      setMonthlyTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const updateDate = (type, direction) => {
    const currentDate = new Date(dates[type]);
    let newDate;

    if (type === 'daily') {
      newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (type === 'weekly') {
      newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (type === 'monthly') {
      newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }

    setDates({
      ...dates,
      [type]: newDate.toISOString().split('T')[0]
    });
  };

  const formatDate = (dateString, type) => {
    const date = new Date(dateString);
    if (type === 'daily') {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    } else if (type === 'weekly') {
      const weekStart = new Date(date);
      const weekEnd = new Date(date);
      weekEnd.setDate(date.getDate() + 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else if (type === 'monthly') {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
  };

  const getTaskStats = (tasks) => {
    const completed = tasks.filter(task => task.status === 'COMPLETED').length;
    const total = tasks.length;
    const totalPoints = tasks
      .filter(task => task.status === 'COMPLETED')
      .reduce((sum, task) => sum + (task.points || 0), 0);
    const totalDuration = tasks.reduce((sum, task) => sum + (task.duration || 0), 0);

    return { completed, total, totalPoints, totalDuration };
  };

  const groupTasksByStream = (tasks) => {
    const grouped = {};
    tasks.forEach(task => {
      const streamName = task.stream?.name || 'Uncategorized';
      if (!grouped[streamName]) {
        grouped[streamName] = [];
      }
      grouped[streamName].push(task);
    });
    return grouped;
  };

  const renderTaskList = (tasks, type, title) => {
    const stats = getTaskStats(tasks);

    if (viewMode === 'time') {
      return (
        <div className="plan-section">
          <div className="plan-header">
            <div className="plan-title">
              <h3>{title}</h3>
              <div className="date-navigation">
                <button onClick={() => updateDate(type, 'prev')} className="nav-btn">
                  <ChevronLeft size={16} />
                </button>
                <span className="current-date">{formatDate(dates[type], type)}</span>
                <button onClick={() => updateDate(type, 'next')} className="nav-btn">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="plan-stats">
              <div className="stat" title="Completed / Total Tasks"><Target size={14} /><span>{stats.completed}/{stats.total}</span></div>
              <div className="stat" title="Total Duration"><Clock size={14} /><span>{stats.totalDuration}m</span></div>
              <div className="stat" title="Total Points"><BarChart3 size={14} /><span>{stats.totalPoints}pts</span></div>
            </div>
          </div>
          <div className="tasks-container">
            {tasks.length === 0 ? (
              <div className="no-tasks"><p>No {type.toLowerCase()} tasks</p></div>
            ) : (
              <div className="tasks-list">
                {tasks.map(task => (
                  <div key={task.id} className={`task-card ${task.status.toLowerCase()}`}>
                    <div className="task-info">
                      <h5 className="task-title">{task.title}</h5>
                      <div className="task-meta">
                        {task.stream && <span className="task-stream">{task.stream.name}</span>}
                        <span className="task-duration"><Clock size={12} /> {task.duration}m</span>
                        <span className="task-points"><Target size={12} /> {task.points}pts</span>
                      </div>
                    </div>
                    <div className="task-status">
                      <span className={`status-badge ${task.status.toLowerCase()}`}>{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    } else if (viewMode === 'stream') {
      // Stream view implementation within specific logic if called directly
      // But for unified view, handled below
      return null;
    }
  };

  // Helper for Unified/Stream views
  const renderUnifiedView = () => {
    const allTasks = [...dailyTasks, ...weeklyTasks, ...monthlyTasks];
    const groupedTasks = groupTasksByStream(allTasks);

    return (
      <div className="plan-section unified-view">
        <div className="plan-header">
          <h3>Consolidated View</h3>
        </div>
        <div className="tasks-container">
          {Object.keys(groupedTasks).length === 0 ? (
            <div className="no-tasks">No tasks found across any plan</div>
          ) : (
            Object.entries(groupedTasks).map(([streamName, streamTasks]) => (
              <div key={streamName} className="stream-group">
                <div className="stream-header">{streamName}</div>
                <div className="tasks-list">
                  {streamTasks.map(task => (
                    <div key={task.id} className={`task-card ${task.status.toLowerCase()}`}>
                      <div className="task-info">
                        <h5 className="task-title">{task.title}</h5>
                        <div className="task-meta">
                          <span className="task-duration"><Clock size={12} /> {task.duration}m</span>
                          <span className="task-points"><Target size={12} /> {task.points}pts</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: '8px' }}>({task.type})</span>
                        </div>
                      </div>
                      <div className="task-status">
                        <span className={`status-badge ${task.status.toLowerCase()}`}>{task.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading plans...</div>;

  return (
    <div className="view-plan-page">
      <div className="view-plan-container">
        <div className="view-plan-header">
          <h1>Plan Overview</h1>
          <p>Track your progress across daily, weekly, and monthly goals</p>

          <div className="view-controls">
            <div className="view-mode-toggle">
              <button
                onClick={() => setViewMode('time')}
                className={`toggle-btn ${viewMode === 'time' ? 'active' : ''}`}
              >
                <Clock size={16} />
                Time View
              </button>
              <button
                onClick={() => setViewMode('stream')}
                className={`toggle-btn ${viewMode === 'stream' ? 'active' : ''}`}
              >
                <Layers size={16} />
                Stream View
              </button>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="plans-grid">
          {viewMode === 'time' && (
            <>
              {renderTaskList(dailyTasks, 'daily', 'Daily Plan')}
              {renderTaskList(weeklyTasks, 'weekly', 'Weekly Goals')}
              {renderTaskList(monthlyTasks, 'monthly', 'Monthly Targets')}
            </>
          )}

          {viewMode === 'stream' && renderUnifiedView()}
        </div>

        {/* Summary Section */}
        <div className="summary-section">
          <h3>Total Aggregates</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">
                <LayoutGrid size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-value">
                  {dailyTasks.length + weeklyTasks.length + monthlyTasks.length}
                </span>
                <span className="summary-label">Total Tasks</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <Target size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-value">
                  {[...dailyTasks, ...weeklyTasks, ...monthlyTasks]
                    .filter(task => task.status === 'COMPLETED').length}
                </span>
                <span className="summary-label">Completed</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <Clock size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-value">
                  {[...dailyTasks, ...weeklyTasks, ...monthlyTasks]
                    .reduce((sum, task) => sum + (task.duration || 0), 0)}m
                </span>
                <span className="summary-label">Time Scheduled</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <BarChart3 size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-value">
                  {[...dailyTasks, ...weeklyTasks, ...monthlyTasks]
                    .filter(task => task.status === 'COMPLETED')
                    .reduce((sum, task) => sum + (task.points || 0), 0)}
                </span>
                <span className="summary-label">Points Earned</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPlanPage;