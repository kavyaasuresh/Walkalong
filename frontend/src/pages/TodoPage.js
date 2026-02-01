import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Trash2, Clock, Target } from 'lucide-react';
import { todoAPI } from '../services/api';
import './TodoPage.css';

const TodoPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', type: 'DAILY', duration: 30, points: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const createTask = async () => {
    if (!newTask.title.trim()) return;
    
    try {
      const response = await todoAPI.createTask(newTask);
      setTasks([response.data, ...tasks]);
      setNewTask({ title: '', type: 'DAILY', duration: 30, points: 10 });
    } catch (err) {
      setError('Failed to create task');
      console.error('Failed to create task:', err);
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      const response = await todoAPI.updateTaskStatus(id, status);
      setTasks(tasks.map(task => task.id === id ? response.data : task));
    } catch (err) {
      setError('Failed to update task');
      console.error('Failed to update task:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await todoAPI.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Failed to delete task:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'SKIPPED': return '#ef4444';
      default: return '#6b7280';
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

  const completedTasks = tasks.filter(task => task.status === 'COMPLETED');
  const totalPoints = completedTasks.reduce((sum, task) => sum + (task.points || 0), 0);

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="todo-page">
      <div className="todo-container">
        <div className="todo-header">
          <h1>Todo List</h1>
          <div className="stats">
            <div className="stat-item">
              <Target className="stat-icon" />
              <span>{tasks.length} Total</span>
            </div>
            <div className="stat-item">
              <Check className="stat-icon" />
              <span>{completedTasks.length} Completed</span>
            </div>
            <div className="stat-item">
              <Clock className="stat-icon" />
              <span>{totalPoints} Points</span>
            </div>
          </div>
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

        {/* Tasks List */}
        <div className="tasks-list">
          {tasks.length === 0 ? (
            <div className="empty-state">
              <Target size={48} />
              <h3>No tasks yet</h3>
              <p>Add your first task to get started!</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={`task-item ${task.status.toLowerCase()}`}>
                <div className="task-content">
                  <div className="task-header">
                    <span className="task-type-icon">{getTypeIcon(task.type)}</span>
                    <h3 className="task-title">{task.title}</h3>
                    <span className="task-type-badge">{task.type}</span>
                  </div>
                  
                  <div className="task-details">
                    <div className="task-meta">
                      <span className="task-duration">
                        <Clock size={14} />
                        {task.duration}min
                      </span>
                      <span className="task-points">
                        <Target size={14} />
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
                  
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="delete-btn"
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoPage;