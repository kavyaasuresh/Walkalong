import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Clock, Play, Pause, Square, Filter } from 'lucide-react';
import { todoAPI, streamsAPI } from '../services/api';
import './TasksPage.css';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [streams, setStreams] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    type: 'DAILY', 
    duration: 30, 
    points: 10,
    streamId: '' 
  });
  const [filters, setFilters] = useState({
    type: 'ALL',
    status: 'ALL',
    stream: 'ALL'
  });
  const [editingTask, setEditingTask] = useState(null);
  const [timers, setTimers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchStreams();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await todoAPI.getAllTasks();
      setTasks(response.data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStreams = async () => {
    try {
      const response = await streamsAPI.getAllStreams();
      setStreams(response.data);
    } catch (err) {
      console.error('Failed to fetch streams:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (filters.type !== 'ALL') {
      filtered = filtered.filter(task => task.type === filters.type);
    }

    if (filters.status !== 'ALL') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.stream !== 'ALL') {
      filtered = filtered.filter(task => task.stream?.id?.toString() === filters.stream);
    }

    setFilteredTasks(filtered);
  };

  const createTask = async () => {
    if (!newTask.title.trim()) return;
    
    try {
      const taskData = {
        ...newTask,
        stream: newTask.streamId ? { id: parseInt(newTask.streamId) } : null
      };
      const response = await todoAPI.createTask(taskData);
      setTasks([response.data, ...tasks]);
      setNewTask({ title: '', type: 'DAILY', duration: 30, points: 10, streamId: '' });
    } catch (err) {
      setError('Failed to create task');
      console.error('Failed to create task:', err);
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const response = await todoAPI.updateTask(id, updates);
      setTasks(tasks.map(task => task.id === id ? response.data : task));
      setEditingTask(null);
    } catch (err) {
      setError('Failed to update task');
      console.error('Failed to update task:', err);
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      const response = await todoAPI.updateTaskStatus(id, status);
      setTasks(tasks.map(task => task.id === id ? response.data : task));
    } catch (err) {
      setError('Failed to update task status');
      console.error('Failed to update task status:', err);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await todoAPI.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Failed to delete task:', err);
    }
  };

  // Timer functions
  const startTimer = (taskId) => {
    const timer = setInterval(() => {
      setTimers(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          elapsed: (prev[taskId]?.elapsed || 0) + 1
        }
      }));
    }, 1000);

    setTimers(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        timer,
        isRunning: true
      }
    }));
  };

  const pauseTimer = (taskId) => {
    const timerData = timers[taskId];
    if (timerData?.timer) {
      clearInterval(timerData.timer);
      setTimers(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          isRunning: false
        }
      }));
    }
  };

  const resetTimer = (taskId) => {
    const timerData = timers[taskId];
    if (timerData?.timer) {
      clearInterval(timerData.timer);
    }
    setTimers(prev => ({
      ...prev,
      [taskId]: {
        elapsed: 0,
        isRunning: false,
        timer: null
      }
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return <Check size={16} className="status-icon completed" />;
      case 'PENDING': return <Clock size={16} className="status-icon pending" />;
      case 'SKIPPED': return <X size={16} className="status-icon skipped" />;
      default: return <Clock size={16} className="status-icon" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'DAILY': return '📅';
      case 'WEEKLY': return '📊';
      case 'MONTHLY': return '🎯';
      default: return '📋';
    }
  };

  const getStreamName = (task) => {
    return task.stream?.name || 'No Stream';
  };

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="tasks-page">
      <div className="tasks-container">
        <div className="tasks-header">
          <h1>Task Management</h1>
          <p>Manage your learning tasks with timers and stream organization</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Add New Task */}
        <div className="add-task-section">
          <div className="add-task-form">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="task-input"
              onKeyPress={(e) => e.key === 'Enter' && createTask()}
            />
            
            <select
              value={newTask.streamId}
              onChange={(e) => setNewTask({ ...newTask, streamId: e.target.value })}
              className="task-stream"
            >
              <option value="">No Stream</option>
              {streams.map(stream => (
                <option key={stream.id} value={stream.id}>{stream.name}</option>
              ))}
            </select>
            
            <select
              value={newTask.type}
              onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
              className="task-type"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
            
            <input
              type="number"
              placeholder="Duration (min)"
              value={newTask.duration}
              onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
              className="task-duration"
              min="5"
              max="480"
            />
            
            <input
              type="number"
              placeholder="Points"
              value={newTask.points}
              onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) })}
              className="task-points"
              min="1"
              max="100"
            />
            
            <button onClick={createTask} className="add-btn">
              <Plus size={20} />
              Add Task
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters">
            <div className="filter-group">
              <Filter size={16} />
              <span>Filters:</span>
            </div>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="filter-select"
            >
              <option value="ALL">All Types</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="filter-select"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="SKIPPED">Skipped</option>
            </select>
            
            <select
              value={filters.stream}
              onChange={(e) => setFilters({ ...filters, stream: e.target.value })}
              className="filter-select"
            >
              <option value="ALL">All Streams</option>
              {streams.map(stream => (
                <option key={stream.id} value={stream.id}>{stream.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="tasks-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <Clock size={48} />
              <h3>No tasks found</h3>
              <p>Create a task or adjust your filters</p>
            </div>
          ) : (
            filteredTasks.map(task => {
              const timerData = timers[task.id] || { elapsed: 0, isRunning: false };
              return (
                <div key={task.id} className={`task-item ${task.status.toLowerCase()}`}>
                  <div className="task-content">
                    <div className="task-header">
                      <span className="task-type-icon">{getTypeIcon(task.type)}</span>
                      <div className="task-status-icon">{getStatusIcon(task.status)}</div>
                      {editingTask === task.id ? (
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => setTasks(tasks.map(t => 
                            t.id === task.id ? { ...t, title: e.target.value } : t
                          ))}
                          onBlur={() => updateTask(task.id, { title: task.title })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateTask(task.id, { title: task.title });
                            }
                          }}
                          className="edit-input"
                          autoFocus
                        />
                      ) : (
                        <h3 className="task-title">{task.title}</h3>
                      )}
                      <span className="task-stream-badge">{getStreamName(task)}</span>
                      <span className="task-type-badge">{task.type}</span>
                    </div>
                    
                    <div className="task-details">
                      <div className="task-meta">
                        <span className="task-duration">
                          <Clock size={14} />
                          {task.duration}min planned
                        </span>
                        <span className="task-points">
                          {task.points}pts
                        </span>
                        <span className="task-date">
                          {task.assignedDate}
                        </span>
                        {task.completedDate && (
                          <span className="completed-date">
                            ✅ {task.completedDate}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timer */}
                    <div className="task-timer">
                      <div className="timer-display">
                        <Clock size={16} />
                        <span className="timer-time">{formatTime(timerData.elapsed)}</span>
                        <span className="timer-status">
                          {timerData.isRunning ? '🔴 Running' : '⏸️ Paused'}
                        </span>
                      </div>
                      <div className="timer-controls">
                        {!timerData.isRunning ? (
                          <button
                            onClick={() => startTimer(task.id)}
                            className="timer-btn start"
                            title="Start timer"
                          >
                            <Play size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => pauseTimer(task.id)}
                            className="timer-btn pause"
                            title="Pause timer"
                          >
                            <Pause size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => resetTimer(task.id)}
                          className="timer-btn reset"
                          title="Reset timer"
                        >
                          <Square size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Revision Date */}
                    <div className="revision-section">
                      <label className="revision-label">Revision Date:</label>
                      <input
                        type="date"
                        value={task.revisionDate || ''}
                        onChange={(e) => {
                          const updatedTasks = tasks.map(t => 
                            t.id === task.id ? { ...t, revisionDate: e.target.value } : t
                          );
                          setTasks(updatedTasks);
                          updateTask(task.id, { revisionDate: e.target.value });
                        }}
                        className="revision-date-input"
                      />
                      {task.revisionDate && (
                        <span className="revision-indicator">
                          📅 Revise: {new Date(task.revisionDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="task-actions">
                    <div className="status-buttons">
                      <button
                        onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                        className={`status-btn complete ${task.status === 'COMPLETED' ? 'active' : ''}`}
                        title="Mark as completed"
                      >
                        <Check size={16} />
                      </button>
                      
                      <button
                        onClick={() => updateTaskStatus(task.id, 'PENDING')}
                        className={`status-btn pending ${task.status === 'PENDING' ? 'active' : ''}`}
                        title="Mark as pending"
                      >
                        <Clock size={16} />
                      </button>
                      
                      <button
                        onClick={() => updateTaskStatus(task.id, 'SKIPPED')}
                        className={`status-btn skip ${task.status === 'SKIPPED' ? 'active' : ''}`}
                        title="Mark as skipped"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="edit-delete-buttons">
                      <button
                        onClick={() => setEditingTask(editingTask === task.id ? null : task.id)}
                        className="edit-btn"
                        title="Edit task"
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="delete-btn"
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;