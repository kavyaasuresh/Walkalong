import React, { useState, useEffect } from 'react';
import { Calendar, Heart, Smile, TrendingUp, Save, Zap, Activity } from 'lucide-react';
import { moodAPI } from '../services/api';
import './MoodPage.css';

const MoodPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMood, setCurrentMood] = useState({
    mood: 3,
    energy: 3,
    motivation: 3,
    notes: ''
  });
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMoodByDate(selectedDate);
    fetchMoodHistory();
  }, [selectedDate]);

  const fetchMoodByDate = async (date) => {
    try {
      setLoading(true);
      const response = await moodAPI.getMoodByDate(date);
      if (response.data) {
        setCurrentMood(response.data);
      } else {
        setCurrentMood({ mood: 3, energy: 3, motivation: 3, notes: '' });
      }
    } catch (err) {
      console.error('Failed to fetch mood:', err);
      // Default state on failure or 404
      setCurrentMood({ mood: 3, energy: 3, motivation: 3, notes: '' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMoodHistory = async () => {
    try {
      const response = await moodAPI.getMoodHistory();
      setMoodHistory(response.data.slice(0, 6)); // First 6 items
    } catch (err) {
      console.error('Failed to fetch mood history:', err);
    }
  };

  const saveMood = async () => {
    try {
      setSaving(true);
      setError(null);

      const moodData = {
        ...currentMood,
        date: selectedDate
      };

      if (currentMood.id) {
        await moodAPI.updateMood(currentMood.id, moodData);
      } else {
        const response = await moodAPI.createMood(moodData);
        setCurrentMood(response.data);
      }

      fetchMoodHistory();
    } catch (err) {
      console.error('Failed to save mood:', err);
      setError('Failed to save mood entry');
    } finally {
      setSaving(false);
    }
  };

  const getMoodEmoji = (level) => {
    const emojis = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };
    return emojis[level] || '😐';
  };

  const getEnergyEmoji = (level) => {
    const emojis = { 1: '🪫', 2: '🔋', 3: '⚡', 4: '🔥', 5: '🚀' };
    return emojis[level] || '⚡';
  };

  const getMotivationEmoji = (level) => {
    const emojis = { 1: '🛌', 2: '🚶', 3: '🏃', 4: '🧗', 5: '🏆' };
    return emojis[level] || '🏃';
  };

  const getMoodColor = (level) => {
    // Return colors matching the theme accents
    const colors = {
      1: '#ef4444', // Red
      2: '#f97316', // Orange
      3: '#eab308', // Yellow
      4: '#22c55e', // Green
      5: '#10b981'  // Emerald
    };
    return colors[level] || '#64748b';
  };

  if (loading) return <div className="loading">Loading mood data...</div>;

  return (
    <div className="mood-page">
      <div className="mood-container">
        <div className="mood-header">
          <h1>Mood Tracker</h1>
          <p>Monitor your wellbeing and mental state</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="date-section">
          <div className="date-selector">
            <Calendar size={20} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
            <span className="day-display">
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="mood-entry-section">
          <div className="mood-grid">

            <div className="mood-card">
              <div className="mood-card-header">
                <Heart className="mood-icon" />
                <h3>Mood</h3>
                <span className="mood-emoji">{getMoodEmoji(currentMood.mood)}</span>
              </div>
              <div className="rating-section">
                <div className="rating-scale">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setCurrentMood({ ...currentMood, mood: level })}
                      className={`rating-btn ${currentMood.mood >= level ? 'active' : ''}`}
                      style={{
                        backgroundColor: currentMood.mood >= level ? getMoodColor(level) : 'transparent',
                        borderColor: currentMood.mood >= level ? 'transparent' : 'var(--glass-border)'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="rating-labels">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            <div className="mood-card">
              <div className="mood-card-header">
                <Zap className="mood-icon" />
                <h3>Energy</h3>
                <span className="mood-emoji">{getEnergyEmoji(currentMood.energy)}</span>
              </div>
              <div className="rating-section">
                <div className="rating-scale">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setCurrentMood({ ...currentMood, energy: level })}
                      className={`rating-btn ${currentMood.energy >= level ? 'active' : ''}`}
                      style={{
                        backgroundColor: currentMood.energy >= level ? '#6366f1' : 'transparent',
                        borderColor: currentMood.energy >= level ? 'transparent' : 'var(--glass-border)'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="rating-labels">
                  <span>Drained</span>
                  <span>Charged</span>
                </div>
              </div>
            </div>

            <div className="mood-card">
              <div className="mood-card-header">
                <Activity className="mood-icon" />
                <h3>Motivation</h3>
                <span className="mood-emoji">{getMotivationEmoji(currentMood.motivation)}</span>
              </div>
              <div className="rating-section">
                <div className="rating-scale">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setCurrentMood({ ...currentMood, motivation: level })}
                      className={`rating-btn ${currentMood.motivation >= level ? 'active' : ''}`}
                      style={{
                        backgroundColor: currentMood.motivation >= level ? '#8b5cf6' : 'transparent',
                        borderColor: currentMood.motivation >= level ? 'transparent' : 'var(--glass-border)'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="rating-labels">
                  <span>Stuck</span>
                  <span>Driven</span>
                </div>
              </div>
            </div>
          </div>

          <div className="notes-section">
            <h3>Daily Reflections</h3>
            <textarea
              placeholder="What factors influenced your mood today?"
              value={currentMood.notes || ''}
              onChange={(e) => setCurrentMood({ ...currentMood, notes: e.target.value })}
              className="notes-textarea"
            />
          </div>

          <div className="save-section">
            <button
              onClick={saveMood}
              disabled={saving}
              className="save-btn"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>

        <div className="mood-history-section">
          <h3>Recent History</h3>
          <div className="history-grid">
            {moodHistory.length === 0 ? (
              <div className="empty-history">
                <p>No mood logs found.</p>
              </div>
            ) : (
              moodHistory.map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="history-moods">
                    <div className="history-mood-item" title="Mood">
                      <span className="history-emoji">{getMoodEmoji(entry.mood)}</span>
                    </div>
                    <div className="history-mood-item" title="Energy">
                      <span className="history-emoji">{getEnergyEmoji(entry.energy)}</span>
                    </div>
                    <div className="history-mood-item" title="Motivation">
                      <span className="history-emoji">{getMotivationEmoji(entry.motivation)}</span>
                    </div>
                  </div>
                  {entry.notes && (
                    <div className="history-notes">
                      {entry.notes.length > 40 ? entry.notes.substring(0, 40) + '...' : entry.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodPage;