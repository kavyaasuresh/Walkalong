import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Calendar, Star, BookOpen } from 'lucide-react';
import { workDoneAPI } from '../services/api';
import './WorkDonePage.css';

const WorkDonePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentEntry, setCurrentEntry] = useState({
    items: [],
    satisfactionLevel: 3,
    notes: '',
    totalPoints: 0
  });
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const categories = ['Study', 'Project', 'Reading', 'Exercise', 'Practice', 'Other'];


  useEffect(() => {
    fetchEntryByDate(selectedDate);
    fetchRecentEntries();
  }, [selectedDate]);

  const fetchEntryByDate = async (date) => {
    try {
      setLoading(true);
      const response = await workDoneAPI.getEntryByDate(date);
      setCurrentEntry(response.data || {
        items: [],
        satisfactionLevel: 3,
        notes: '',
        totalPoints: 0
      });
    } catch (err) {
      console.error('Failed to fetch entry:', err);
      setError('Failed to load entry');
      setCurrentEntry({
        items: [],
        satisfactionLevel: 3,
        notes: '',
        totalPoints: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentEntries = async () => {
    try {
      const response = await workDoneAPI.getAllEntries();
      setRecentEntries(response.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch recent entries:', err);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const addNewItem = () => {
    const newItem = {
      description: '',
      points: 10,
      category: 'Study',
      completed: true
    };
    
    setCurrentEntry(prev => ({
      ...prev,
      items: [...(prev?.items || []), newItem]
    }));
  };

  const updateItem = (index, field, value) => {
    setCurrentEntry(prev => ({
      ...prev,
      items: (prev?.items || []).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (index) => {
    setCurrentEntry(prev => ({
      ...prev,
      items: (prev?.items || []).filter((_, i) => i !== index)
    }));
  };

  const updateSatisfaction = (level) => {
    setCurrentEntry(prev => ({
      ...prev,
      satisfactionLevel: level
    }));
  };

  const updateNotes = (notes) => {
    setCurrentEntry(prev => ({
      ...prev,
      notes
    }));
  };

  const calculateTotalPoints = () => {
    return currentEntry?.items?.reduce((total, item) => total + (item.points || 0), 0) || 0;
  };

  const saveEntry = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const entryToSave = {
        ...currentEntry,
        date: selectedDate,
        totalPoints: calculateTotalPoints()
      };

      if (currentEntry.id) {
        await workDoneAPI.updateEntry(currentEntry.id, entryToSave);
      } else {
        const response = await workDoneAPI.createEntry(entryToSave);
        setCurrentEntry(response.data);
      }
      
      fetchRecentEntries();
    } catch (err) {
      console.error('Failed to save entry:', err);
      setError('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const getSatisfactionEmoji = (level) => {
    const emojis = { 1: '😞', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
    return emojis[level] || '😐';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="workdone-page">
      <div className="workdone-container">
        {/* Book Cover */}
        <div className="book-cover">
          <div className="book-spine"></div>
          <div className="book-content">
            
            {/* Header */}
            <div className="workdone-header">
              <div className="header-left">
                <BookOpen className="header-icon" />
                <h1>Work Done Diary</h1>
              </div>
              <div className="date-selector">
                <Calendar size={20} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="date-input"
                />
                <span className="day-display">{getDayOfWeek(selectedDate)}</span>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Main Content */}
            <div className="diary-content">
              
              {/* Tasks Section */}
              <div className="tasks-section">
                <div className="section-header">
                  <h2>Today's Accomplishments</h2>
                  <button onClick={addNewItem} className="add-btn">
                    <Plus size={16} />
                    Add Task
                  </button>
                </div>

                <div className="tasks-table">
                  {currentEntry?.items?.map((item, index) => (
                    <div key={index} className="task-row">
                      <input
                        type="text"
                        placeholder="What did you accomplish?"
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="task-description"
                      />
                      
                      <select
                        value={item.category || 'Study'}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                        className="task-category"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      
                      <div className="points-input">
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={item.points || 10}
                          onChange={(e) => updateItem(index, 'points', parseInt(e.target.value))}
                          className="points-field"
                        />
                        <span className="points-label">pts</span>
                      </div>
                      
                      <button
                        onClick={() => removeItem(index)}
                        className="remove-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  
                  {(!currentEntry?.items || currentEntry.items.length === 0) && (
                    <div className="empty-state">
                      <p>No tasks added yet. Click "Add Task" to get started!</p>
                    </div>
                  )}
                </div>

                <div className="points-summary">
                  <span className="total-points">
                    Total Points: <strong>{calculateTotalPoints()}</strong>
                  </span>
                </div>
              </div>

              {/* Satisfaction Section */}
              <div className="satisfaction-section">
                <h3>How satisfied are you with today's work?</h3>
                <div className="satisfaction-rating">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => updateSatisfaction(level)}
                      className={`satisfaction-star ${currentEntry?.satisfactionLevel >= level ? 'active' : ''}`}
                    >
                      <Star size={24} fill={currentEntry?.satisfactionLevel >= level ? '#fbbf24' : 'none'} />
                    </button>
                  ))}
                  <span className="satisfaction-emoji">
                    {getSatisfactionEmoji(currentEntry?.satisfactionLevel)}
                  </span>
                </div>
              </div>

              {/* Notes Section */}
              <div className="notes-section">
                <h3>Daily Reflection</h3>
                <textarea
                  placeholder="Write your thoughts about today's work..."
                  value={currentEntry?.notes || ''}
                  onChange={(e) => updateNotes(e.target.value)}
                  className="notes-textarea"
                  rows="4"
                />
              </div>

              {/* Save Button */}
              <div className="save-section">
                <button
                  onClick={saveEntry}
                  disabled={saving}
                  className="save-btn"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Entries Sidebar */}
        <div className="recent-entries">
          <h3>Recent Entries</h3>
          <div className="entries-list">
            {recentEntries.map(entry => (
              <div
                key={entry.id}
                onClick={() => handleDateChange(entry.date)}
                className={`entry-item ${entry.date === selectedDate ? 'active' : ''}`}
              >
                <div className="entry-date">
                  {new Date(entry.date).toLocaleDateString()}
                </div>
                <div className="entry-summary">
                  <span className="entry-points">{entry.totalPoints} pts</span>
                  <span className="entry-satisfaction">
                    {getSatisfactionEmoji(entry.satisfactionLevel)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkDonePage;