import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Target, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
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
      const [dailyResponse, weeklyResponse, monthlyResponse] = await Promise.all([
        viewPlanAPI.getDailyPlan(dates.daily),
        viewPlanAPI.getWeeklyPlan(dates.weekly),
        viewPlanAPI.getMonthlyPlan(dates.monthly)
      ]);
      
      setDailyTasks(dailyResponse.data);
      setWeeklyTasks(weeklyResponse.data);
      setMonthlyTasks(monthlyResponse.data);
    } catch (err) {
      setError('Failed to load plans');
      console.error('Failed to fetch plans:', err);
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
        year: 'numeric', 
        month: 'long', 
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
      const streamName = task.stream?.name || 'No Stream';
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
      // Time-based view (original)
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
              <div className="stat"><Target size={16} /><span>{stats.completed}/{stats.total}</span></div>
              <div className="stat"><Clock size={16} /><span>{stats.totalDuration}min</span></div>
              <div className="stat"><BarChart3 size={16} /><span>{stats.totalPoints}pts</span></div>
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
                        <span className="task-duration">{task.duration}min</span>
                        <span className="task-points">{task.points}pts</span>
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
      // Stream-based view
      const groupedTasks = groupTasksByStream(tasks);
      return (
        <div className="plan-section stream-view">
          <div className="plan-header">
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
          <div className="tasks-container">
            {Object.entries(groupedTasks).map(([streamName, streamTasks]) => (
              <div key={streamName} className="stream-group">
                <h4 className="stream-header">{streamName}</h4>
                <div className="tasks-list">
                  {streamTasks.map(task => (
                    <div key={task.id} className={`task-card ${task.status.toLowerCase()}`}>
                      <div className="task-info">
                        <h5 className="task-title">{task.title}</h5>
                        <div className="task-meta">
                          <span className="task-duration">{task.duration}min</span>
                          <span className="task-points">{task.points}pts</span>
                        </div>
                      </div>
                      <div className="task-status">
                        <span className={`status-badge ${task.status.toLowerCase()}`}>{task.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      // Mixed view: Stream as header, then time subheadings
      const groupedTasks = groupTasksByStream(tasks);
      return (
        <div className="plan-section mixed-view">
          <div className="plan-header">
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
          <div className="tasks-container">
            {Object.entries(groupedTasks).map(([streamName, streamTasks]) => (
              <div key={streamName} className="stream-group">
                <h4 className="stream-header">{streamName}</h4>
                <div className="time-subgroup">
                  <h5 className="time-subheader">{title}</h5>
                  <div className="tasks-list">
                    {streamTasks.map(task => (
                      <div key={task.id} className={`task-card ${task.status.toLowerCase()}`}>
                        <div className="task-info">
                          <h5 className="task-title">{task.title}</h5>
                          <div className="task-meta">
                            <span className="task-duration">{task.duration}min</span>
                            <span className="task-points">{task.points}pts</span>
                          </div>
                        </div>
                        <div className="task-status">
                          <span className={`status-badge ${task.status.toLowerCase()}`}>{task.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  if (loading) return <div className="loading">Loading plans...</div>;

  return (
    <div className="view-plan-page">
      <div className="view-plan-container">
        <div className="view-plan-header">
          <h1>View Plan</h1>
          <p>Consolidated view of your learning schedule</p>
          
          <div className="view-controls">
            <div className="view-mode-toggle">
              <button
                onClick={() => setViewMode('time')}
                className={`toggle-btn ${viewMode === 'time' ? 'active' : ''}`}
              >
                <Clock size={16} />
                Time-based
              </button>
              <button
                onClick={() => setViewMode('stream')}
                className={`toggle-btn ${viewMode === 'stream' ? 'active' : ''}`}
              >
                <BarChart3 size={16} />
                Stream-based
              </button>
              <button
                onClick={() => setViewMode('mixed')}
                className={`toggle-btn ${viewMode === 'mixed' ? 'active' : ''}`}
              >
                <Target size={16} />
                Mixed
              </button>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="plans-grid">
          {viewMode === 'time' && (
            <>
              {renderTaskList(dailyTasks, 'daily', 'Daily Tasks')}
              {renderTaskList(weeklyTasks, 'weekly', 'Weekly Tasks')}
              {renderTaskList(monthlyTasks, 'monthly', 'Monthly Tasks')}
            </>
          )}
          
          {(viewMode === 'stream' || viewMode === 'mixed') && (
            <div className="unified-view">
              {renderTaskList([...dailyTasks, ...weeklyTasks, ...monthlyTasks], 'unified', 'All Tasks')}
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="summary-section">
          <h3>Overall Summary</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon">
                <Calendar size={24} />
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
                    .reduce((sum, task) => sum + (task.duration || 0), 0)}min
                </span>
                <span className="summary-label">Total Time</span>
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