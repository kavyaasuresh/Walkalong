import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Clock, Play, Pause, Save, Filter, ChevronDown, ListTodo, CalendarDays, BarChart2, Lock } from 'lucide-react';
import { todoAPI, streamsAPI } from '../services/api';
import './TasksPage.css';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [streams, setStreams] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    streamId: '',
    type: 'DAILY',
    deadline: '',
    revisionDate: '',
    revisionCount: 0
  });
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [streamFilter, setStreamFilter] = useState('ALL');
  const [activeTimer, setActiveTimer] = useState(null); // { id: taskId, startTime: Date.now(), elapsed: task.durationSeconds }
  const [sessionTime, setSessionTime] = useState(0);
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

  // Stopwatch Logic
  const toggleTimer = (taskId) => {
    if (activeTimer === taskId) {
      // Pause: Save currently accumulated time
      saveTime(taskId);
      clearInterval(timerRef.current);
      setActiveTimer(null);
      setSessionTime(0);
    } else {
      // Start
      if (activeTimer) saveTime(activeTimer); // Save previous before switching
      clearInterval(timerRef.current);

      setActiveTimer(taskId);
      setSessionTime(0);
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    }
  };

  const saveTime = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newDurationSeconds = (task.durationSeconds || 0) + sessionTime;

    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, durationSeconds: newDurationSeconds } : t));
      await todoAPI.updateTask(taskId, { durationSeconds: newDurationSeconds });
      // Reset session time if we paused, else it keeps growing in interval
      if (activeTimer !== taskId) setSessionTime(0);
    } catch (e) {
      console.error("Failed to save time", e);
    }
  };

  const formatStopwatch = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins < 10 && hrs > 0 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredTasks = tasks.filter(t => {
    const statusMatch = statusFilter === 'ALL' || t.status === statusFilter;
    const streamMatch = streamFilter === 'ALL' || (t.stream && t.stream.id.toString() === streamFilter);
    return statusMatch && streamMatch;
  });

  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="tasks-page-container">
      <div className="tasks-header">
        <h1>Task Master</h1>

        <div className="tasks-filter-bar">
          <div className="filter-group">
            <Filter size={18} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="qa-select filter-status">
              <option value="ALL">All Status</option>
              {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select value={streamFilter} onChange={e => setStreamFilter(e.target.value)} className="qa-select filter-stream">
              <option value="ALL">All Streams</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <form className="quick-add-bar expanded-form" onSubmit={createTask}>
            <input
              type="text"
              placeholder="Task Title..."
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
              className="qa-input-main"
              required
            />
            <select
              value={newTask.streamId}
              onChange={e => setNewTask({ ...newTask, streamId: e.target.value })}
              className="qa-select-sub"
            >
              <option value="">Stream...</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={newTask.type}
              onChange={e => setNewTask({ ...newTask, type: e.target.value })}
              className="qa-select-sub"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
            <input
              type="date"
              value={newTask.deadline}
              onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
              className="qa-input-date"
            />
            <button type="submit" className="qa-btn"><Plus size={18} /> Add Task</button>
          </form>
        </div>
      </div>

      <div className="tasks-table-wrapper">
        <table className="tasks-table">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Title</th>
              <th>Stream</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Stopwatch</th>
              <th>Revision</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr><td colSpan="7" className="empty-row">No tasks found matching filters</td></tr>
            ) : (
              filteredTasks.map(task => {
                const isCompleted = task.status === 'COMPLETED';
                const isTimerActive = activeTimer === task.id;
                const totalDisplayTime = (task.durationSeconds || 0) + (isTimerActive ? sessionTime : 0);

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
                          {formatStopwatch(totalDisplayTime)}
                        </span>
                        {!isCompleted && !isTimerActive && sessionTime === 0 && (
                          <button className="save-time-btn" onClick={() => saveTime(task.id)} title="Save Progress">
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