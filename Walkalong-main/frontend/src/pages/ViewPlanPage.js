import React, { useState, useEffect } from 'react';
import { streamsAPI, todoAPI } from '../services/api';
import { Calendar, Layout, List, CheckCircle, Clock } from 'lucide-react';
import './ViewPlanPage.css';

const ViewPlanPage = () => {
  const [viewMode, setViewMode] = useState('TIME'); // 'TIME' or 'STREAM'
  const [tasks, setTasks] = useState([]);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, streamsRes] = await Promise.all([
          todoAPI.getAllTasks(),
          streamsAPI.getAllStreams()
        ]);
        setTasks(tasksRes.data);
        setStreams(streamsRes.data);
      } catch (error) {
        console.error("Error fetching plan data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group by Time (Original Logic)
  const getTasksByTime = () => {
    const sorted = [...tasks].sort((a, b) => {
      // Mock time sort or use existing generic sort
      return 0;
    });
    return sorted;
  };

  // Group by Stream (New Logic: List Layout)
  const getTasksByStream = () => {
    return streams.map(stream => {
      const streamTasks = tasks.filter(t => t.stream && t.stream.id === stream.id);
      return {
        ...stream,
        tasks: streamTasks
      };
    }).filter(group => group.tasks.length > 0);
  };

  if (loading) return <div className="loading">Loading Plan...</div>;

  const groupedByStream = getTasksByStream();

  return (
    <div className="view-plan-container">
      <header className="plan-header">
        <h1>Your Blueprint</h1>
        <div className="view-toggles">
          <button
            className={`toggle-btn ${viewMode === 'TIME' ? 'active' : ''}`}
            onClick={() => setViewMode('TIME')}
          >
            <Clock size={16} /> Time Flow
          </button>
          <button
            className={`toggle-btn ${viewMode === 'STREAM' ? 'active' : ''}`}
            onClick={() => setViewMode('STREAM')}
          >
            <Layout size={16} /> Stream Focus
          </button>
        </div>
      </header>

      <div className="plan-content">
        {viewMode === 'TIME' ? (
          <div className="time-view">
            {tasks.length === 0 ? <p className="empty-msg">No tasks scheduled.</p> : (
              <div className="time-categories">
                {['Daily', 'Weekly', 'Monthly'].map(category => {
                  const categoryTasks = tasks.filter(t => (t.type || 'Daily').toLowerCase() === category.toLowerCase());
                  if (categoryTasks.length === 0) return null;
                  return (
                    <div key={category} className="time-category-section">
                      <h2 className="category-heading">{category} Plan</h2>
                      <div className="timeline-list">
                        {categoryTasks.map(task => (
                          <div key={task.id} className="timeline-item">
                            <span className="time-marker">{task.deadline ? task.deadline.split('T')[1]?.slice(0, 5) : 'All Day'}</span>
                            <div className="timeline-card-content">
                              <div className="task-info">
                                <h4>{task.title}</h4>
                                <span className="badge">{task.stream?.name || 'General'}</span>
                              </div>
                              <div className="task-mini-status">
                                {task.status === 'COMPLETED' ? <CheckCircle size={16} color="#10b981" /> : <Clock size={16} color="#f59e0b" />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="stream-view-large">
            {/* New "Not Mini Boxes" Layout */}
            {groupedByStream.length === 0 ? <p className="empty-msg">No streams active.</p> : (
              <div className="stream-groups">
                {groupedByStream.map(group => (
                  <div key={group.id} className="stream-group-card">
                    <div className="group-header">
                      <h2>{group.name}</h2>
                      <span className="task-count">{group.tasks.length} Tasks</span>
                    </div>
                    <div className="group-tasks-list">
                      {group.tasks.map(task => (
                        <div key={task.id} className="stream-task-row">
                          <div className="task-status-indicator" data-status={task.status}></div>
                          <span className="task-name">{task.title}</span>
                          <span className="task-meta">{task.duration}m</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPlanPage;