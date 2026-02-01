import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { streamsAPI, todoAPI } from '../services/api'; // Assuming stream stats might come from tasks
import './StreamsPage.css';

const StreamsPage = () => {
  const [streams, setStreams] = useState([]);
  const [newStreamName, setNewStreamName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const response = await streamsAPI.getAllStreams();
      setStreams(response.data || []);
    } catch (err) {
      console.error('Failed to fetch streams:', err);
      setError('Failed to load streams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addStream = async (e) => {
    e.preventDefault();
    if (!newStreamName.trim()) return;

    try {
      const response = await streamsAPI.createStream({ name: newStreamName });
      setStreams([...streams, response.data]);
      setNewStreamName('');
    } catch (err) {
      console.error('Failed to add stream:', err);
      setError('Failed to create stream.');
    }
  };

  const deleteStream = async (e, id) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    if (!window.confirm('Are you sure you want to delete this stream?')) return;

    try {
      await streamsAPI.deleteStream(id);
      setStreams(streams.filter(stream => stream.id !== id));
    } catch (err) {
      console.error('Failed to delete stream:', err);
      setError('Failed to delete stream.');
    }
  };

  const handleStreamClick = (id) => {
    navigate(`/streams/${id}`);
  };

  if (loading) return <div className="loading">Loading streams...</div>;

  return (
    <div className="streams-page">
      <div className="streams-container">
        <div className="streams-header">
          <h1>My Streams</h1>
          <p>Organize your life into focused areas</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="add-stream-section">
          <form className="add-stream-form" onSubmit={addStream}>
            <input
              type="text"
              placeholder="New Stream Name (e.g., Learning React)"
              value={newStreamName}
              onChange={(e) => setNewStreamName(e.target.value)}
              className="stream-input"
            />
            <button type="submit" className="add-btn">
              <Plus size={20} />
              Create Stream
            </button>
          </form>
        </div>

        <div className="streams-grid">
          {streams.length === 0 ? (
            <div className="empty-state">
              <h3>No streams yet</h3>
              <p>Create your first stream to start tracking specific goals.</p>
            </div>
          ) : (
            streams.map(stream => (
              <div
                key={stream.id}
                className="stream-card"
                onClick={() => handleStreamClick(stream.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="stream-header">
                  <div className="stream-icon">
                    <TrendingUp size={24} />
                  </div>
                  <h3 className="stream-name">{stream.name}</h3>
                  <button
                    onClick={(e) => deleteStream(e, stream.id)}
                    className="delete-btn"
                    title="Delete Stream"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="stream-stats">
                  <div className="stat-item">
                    <Clock className="stat-icon" />
                    <div className="stat-content">
                      <span className="stat-value">--</span>
                      <span className="stat-label">Hours</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <CheckCircle className="stat-icon" />
                    <div className="stat-content">
                      <span className="stat-value">--</span>
                      <span className="stat-label">Tasks</span>
                    </div>
                  </div>
                </div>

                <div className="stream-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '0%' }}></div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--accent-primary)', marginTop: '10px' }}>
                  Click to view details & sticky notes
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamsPage;