import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Clock, Play, Pause, Save, Filter, ChevronDown, ListTodo, CalendarDays, BarChart2, Lock } from 'lucide-react';
import { todoAPI, streamsAPI } from '../services/api';
import './TasksPage.css';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [streams, setStreams] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', streamId: '', type: 'DAILY', deadline: '', revisionDate: '', revisionCount: 0 });
  const [filter, setFilter] = useState('ALL');
  const [activeTimer, setActiveTimer] = useState(null); // taskId
  const [elapsedTime, setElapsedTime] = useState(0); // seconds
  const timerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Constants
  const STATUS_OPTIONS = ['PENDING', 'COMPLETED', 'SKIPPED'];

  useEffect(() => {
    fetchData();
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, streamsRes] = await Promise.all([
        todoAPI.getAllTasks(),
        streamsAPI.getAllStreams()
      ]);
      setTasks(tasksRes.data);
      setStreams(streamsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      const res = await todoAPI.createTask(newTask);
      setTasks([...tasks, res.data]);
      setNewTask({ title: '', streamId: '', type: 'DAILY', deadline: '', revisionDate: '', revisionCount: 0 });
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      // Optimistic Update
      setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
      await todoAPI.updateTask(id, { status });
    } catch (error) {
      console.error('Error updating status:', error);
      fetchData(); // Revert
    }
  };

  const updateTaskField = async (id, field, value) => {
    const task = tasks.find(t => t.id === id);
    if (task.status === 'COMPLETED') return; // Lock if completed

    try {
      setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
      // Debounce or save on blur in real app, here direct for simplicity
      await todoAPI.updateTask(id, { [field]: value });
    } catch (error) {
      console.error("Error updating field", error);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await todoAPI.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Timer Logic
  const toggleTimer = (taskId) => {
    if (activeTimer === taskId) {
      // Pause
      clearInterval(timerRef.current);
      setActiveTimer(null);
    } else {
      // Start
      if (activeTimer) clearInterval(timerRef.current); // Stop others
      setActiveTimer(taskId);
      const task = tasks.find(t => t.id === taskId);
      setElapsedTime(0); // In real app, load prev session time if needed
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
  };

  const saveTime = async (taskId) => {
    if (!activeTimer) return;

    const minutes = Math.floor(elapsedTime / 60);
    if (minutes > 0) {
      const task = tasks.find(t => t.id === taskId);
      const newDuration = (task.duration || 0) + minutes;

      try {
        await todoAPI.updateTask(taskId, { duration: newDuration });
        setTasks(tasks.map(t => t.id === taskId ? { ...t, duration: newDuration } : t));
        setElapsedTime(0); // Reset local counter after save
      } catch (e) {
        console.error("Failed to save time", e);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredTasks = tasks.filter(t => filter === 'ALL' || t.status === filter);

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="tasks-page-container">
      <div className="tasks-header">
        <h1>Task Master</h1>

        {/* Quick Add Bar */}
        <form className="quick-add-bar" onSubmit={createTask}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTask.title}
            onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            className="qa-input"
          />
          <select
            value={newTask.streamId}
            onChange={e => setNewTask({ ...newTask, streamId: e.target.value })}
            className="qa-select"
          >
            <option value="">No Stream</option>
            {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            value={newTask.type}
            onChange={e => setNewTask({ ...newTask, type: e.target.value })}
            className="qa-select"
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
          <button type="submit" className="qa-btn"><Plus size={18} /> Add</button>
        </form>
      </div>

      <div className="tasks-table-wrapper">
        <table className="tasks-table">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Title</th>
              <th>Stream</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Timer</th>
              <th>Revision</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr><td colSpan="7" className="empty-row">No tasks found</td></tr>
            ) : (
              filteredTasks.map(task => {
                const isCompleted = task.status === 'COMPLETED';
                const isTimerActive = activeTimer === task.id;

                return (
                  <tr key={task.id} className={`task-row ${isCompleted ? 'completed-row' : ''}`}>
                    <td>
                      <div className="task-title-cell">
                        {isCompleted && <Lock size={14} className="lock-icon" />}
                        <span className={isCompleted ? 'strikethrough' : ''}>{task.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className="stream-badge">{task.stream?.name || 'General'}</span>
                    </td>
                    <td>
                      <input
                        type="date"
                        value={task.deadline ? task.deadline.split('T')[0] : ''}
                        onChange={(e) => updateTaskField(task.id, 'deadline', e.target.value)}
                        disabled={isCompleted}
                        className="table-input date"
                      />
                    </td>
                    <td>
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className={`status-dropdown ${task.status.toLowerCase()}`}
                      >
                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className="timer-cell">
                        <button
                          className={`timer-btn ${isTimerActive ? 'active' : ''}`}
                          onClick={() => toggleTimer(task.id)}
                          disabled={isCompleted}
                        >
                          {isTimerActive ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <span className="time-display">
                          {isTimerActive ? formatTime(elapsedTime) : `${task.duration || 0}m`}
                        </span>
                        {isTimerActive && (
                          <button className="save-time-btn" onClick={() => saveTime(task.id)} title="Save Time">
                            <Save size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="revision-cell">
                        <input
                          type="date"
                          value={task.revisionDate ? task.revisionDate.split('T')[0] : ''}
                          onChange={(e) => updateTaskField(task.id, 'revisionDate', e.target.value)}
                          disabled={isCompleted}
                          className="table-input date-small"
                          title="Revision Date"
                        />
                        <input
                          type="number"
                          value={task.revisionCount || 0}
                          onChange={(e) => updateTaskField(task.id, 'revisionCount', e.target.value)}
                          disabled={isCompleted}
                          className="table-input count-small"
                          title="Revision Count"
                        />
                      </div>
                    </td>
                    <td>
                      <button className="action-btn delete" onClick={() => deleteTask(task.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TasksPage;