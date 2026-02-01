import React, { useState, useEffect } from 'react';
import { Calendar, Heart, Smile, TrendingUp, Save } from 'lucide-react';
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
      setCurrentMood({ mood: 3, energy: 3, motivation: 3, notes: '' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMoodHistory = async () => {
    try {
      const response = await moodAPI.getMoodHistory();
      setMoodHistory(response.data.slice(0, 7));
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
    const emojis = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
    return emojis[level] || '😐';
  };

  const getEnergyEmoji = (level) => {
    const emojis = { 1: '🔋', 2: '🔋', 3: '🔋', 4: '⚡', 5: '⚡' };
    return emojis[level] || '🔋';
  };

  const getMotivationEmoji = (level) => {
    const emojis = { 1: '😴', 2: '😑', 3: '🙂', 4: '💪', 5: '🚀' };
    return emojis[level] || '🙂';
  };

  const getMoodColor = (level) => {
    const colors = {
      1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e', 5: '#10b981'
    };
    return colors[level] || '#6b7280';
  };

  if (loading) return <div className="loading">Loading mood data...</div>;

  return (
    <div className="mood-page">
      <div className="mood-container">
        <div className="mood-header">
          <h1>Mood Tracker</h1>
          <p>Track your daily mood, energy, and motivation levels</p>
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
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
          </div>
        </div>

        <div className="mood-entry-section">
          <div className="mood-grid">
            
            <div className="mood-card">
              <div className="mood-card-header">
                <Heart className="mood-icon" />
                <h3>Overall Mood</h3>
                <span className="mood-emoji">{getMoodEmoji(currentMood.mood)}</span>
              </div>
              <div className="rating-section">
                <div className="rating-scale">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setCurrentMood({ ...currentMood, mood: level })}
                      className={`rating-btn ${currentMood.mood >= level ? 'active' : ''}`}
                      style={{ backgroundColor: currentMood.mood >= level ? getMoodColor(level) : '#e5e7eb' }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="rating-labels">
                  <span>Very Sad</span>
                  <span>Very Happy</span>
                </div>
              </div>
            </div>

            <div className="mood-card">
              <div className="mood-card-header">
                <TrendingUp className="mood-icon" />
                <h3>Energy Level</h3>
                <span className="mood-emoji">{getEnergyEmoji(currentMood.energy)}</span>
              </div>
              <div className="rating-section">
                <div className="rating-scale">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setCurrentMood({ ...currentMood, energy: level })}
                      className={`rating-btn ${currentMood.energy >= level ? 'active' : ''}`}
                      style={{ backgroundColor: currentMood.energy >= level ? '#3b82f6' : '#e5e7eb' }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="rating-labels">
                  <span>Exhausted</span>
                  <span>Energized</span>
                </div>
              </div>
            </div>

            <div className="mood-card">
              <div className="mood-card-header">
                <Smile className="mood-icon" />
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
                      style={{ backgroundColor: currentMood.motivation >= level ? '#8b5cf6' : '#e5e7eb' }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <div className="rating-labels">
                  <span>No Drive</span>
                  <span>Highly Motivated</span>
                </div>
              </div>
            </div>
          </div>

          <div className="notes-section">
            <h3>Daily Notes</h3>
            <textarea
              placeholder="How are you feeling today? What's on your mind?"
              value={currentMood.notes || ''}
              onChange={(e) => setCurrentMood({ ...currentMood, notes: e.target.value })}
              className="notes-textarea"
              rows="4"
            />
          </div>

          <div className="save-section">
            <button
              onClick={saveMood}
              disabled={saving}
              className="save-btn"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Mood Entry'}
            </button>
          </div>
        </div>

        <div className="mood-history-section">
          <h3>Recent Mood History</h3>
          <div className="history-grid">
            {moodHistory.length === 0 ? (
              <div className="empty-history">
                <p>No mood history yet. Start tracking your mood!</p>
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
                    <div className="history-mood-item">
                      <span className="history-emoji">{getMoodEmoji(entry.mood)}</span>
                      <span className="history-label">Mood</span>
                    </div>
                    <div className="history-mood-item">
                      <span className="history-emoji">{getEnergyEmoji(entry.energy)}</span>
                      <span className="history-label">Energy</span>
                    </div>
                    <div className="history-mood-item">
                      <span className="history-emoji">{getMotivationEmoji(entry.motivation)}</span>
                      <span className="history-label">Motivation</span>
                    </div>
                  </div>
                  {entry.notes && (
                    <div className="history-notes">
                      "{entry.notes.substring(0, 50)}{entry.notes.length > 50 ? '...' : ''}"
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