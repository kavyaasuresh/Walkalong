import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Target, Clock, BarChart3 } from 'lucide-react';
import { streamsAPI } from '../services/api';
import './StreamsPage.css';

const StreamsPage = () => {
  const [streams, setStreams] = useState([]);
  const [newStreamName, setNewStreamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const response = await streamsAPI.getAllStreams();
      setStreams(response.data);
    } catch (err) {
      setError('Failed to load streams');
      console.error('Failed to fetch streams:', err);
    } finally {
      setLoading(false);
    }
  };

  const createStream = async () => {
    if (!newStreamName.trim()) return;
    
    try {
      const response = await streamsAPI.createStream({ name: newStreamName });
      setStreams([...streams, response.data]);
      setNewStreamName('');
    } catch (err) {
      setError('Failed to create stream');
      console.error('Failed to create stream:', err);
    }
  };

  const deleteStream = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stream?')) return;
    
    try {
      await streamsAPI.deleteStream(id);
      setStreams(streams.filter(stream => stream.id !== id));
    } catch (err) {
      setError('Failed to delete stream');
      console.error('Failed to delete stream:', err);
    }
  };

  const getStreamStats = (stream) => {
    const tasks = stream.tasks || [];
    const completed = tasks.filter(task => task.status === 'COMPLETED').length;
    const total = tasks.length;
    const totalPoints = tasks
      .filter(task => task.status === 'COMPLETED')
      .reduce((sum, task) => sum + (task.points || 0), 0);
    
    return { completed, total, totalPoints };
  };

  if (loading) return <div className="loading">Loading streams...</div>;

  return (
    <div className="streams-page">
      <div className="streams-container">
        <div className="streams-header">
          <h1>Learning Streams</h1>
          <p>Organize your learning into focused streams</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Add New Stream */}
        <div className="add-stream-section">
          <div className="add-stream-form">
            <input
              type="text"
              placeholder="Enter stream name (e.g., UPSC, DSA, React)"
              value={newStreamName}
              onChange={(e) => setNewStreamName(e.target.value)}
              className="stream-input"
              onKeyPress={(e) => e.key === 'Enter' && createStream()}
            />
            <button onClick={createStream} className="add-btn">
              <Plus size={20} />
              Add Stream
            </button>
          </div>
        </div>

        {/* Streams Grid */}
        <div className="streams-grid">
          {streams.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={48} />
              <h3>No streams yet</h3>
              <p>Create your first learning stream to get started!</p>
            </div>
          ) : (
            streams.map(stream => {
              const stats = getStreamStats(stream);
              return (
                <div key={stream.id} className="stream-card">
                  <div className="stream-header">
                    <div className="stream-icon">
                      <BookOpen size={24} />
                    </div>
                    <h3 className="stream-name">{stream.name}</h3>
                    <button
                      onClick={() => deleteStream(stream.id)}
                      className="delete-btn"
                      title="Delete stream"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="stream-stats">
                    <div className="stat-item">
                      <Target className="stat-icon" />
                      <div className="stat-content">
                        <span className="stat-value">{stats.completed}/{stats.total}</span>
                        <span className="stat-label">Tasks</span>
                      </div>
                    </div>

                    <div className="stat-item">
                      <BarChart3 className="stat-icon" />
                      <div className="stat-content">
                        <span className="stat-value">{stats.totalPoints}</span>
                        <span className="stat-label">Points</span>
                      </div>
                    </div>

                    <div className="stat-item">
                      <Clock className="stat-icon" />
                      <div className="stat-content">
                        <span className="stat-value">
                          {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                        </span>
                        <span className="stat-label">Complete</span>
                      </div>
                    </div>
                  </div>

                  <div className="stream-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="stream-tasks-preview">
                    <h4>Recent Tasks</h4>
                    {stream.tasks && stream.tasks.length > 0 ? (
                      <div className="tasks-preview">
                        {stream.tasks.slice(0, 3).map(task => (
                          <div key={task.id} className={`task-preview ${task.status.toLowerCase()}`}>
                            <span className="task-title">{task.title}</span>
                            <span className="task-status">{task.status}</span>
                          </div>
                        ))}
                        {stream.tasks.length > 3 && (
                          <div className="more-tasks">
                            +{stream.tasks.length - 3} more tasks
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="no-tasks">No tasks yet</p>
                    )}
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

export default StreamsPage;