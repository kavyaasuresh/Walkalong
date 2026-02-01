import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Calendar, Star, BookOpen, Clock, Tag } from 'lucide-react';
import { workDoneAPI, streamsAPI } from '../services/api';
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
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entryRes, streamsRes, historyRes] = await Promise.all([
        workDoneAPI.getEntryByDate(selectedDate).catch(() => ({ data: null })), // Handle 404 gracefully
        streamsAPI.getAllStreams(),
        workDoneAPI.getAllEntries()
      ]);

      if (entryRes.data) {
        setCurrentEntry(entryRes.data);
      } else {
        // Reset if no entry found for this date
        setCurrentEntry({
          items: [],
          satisfactionLevel: 3,
          notes: '',
          totalPoints: 0
        });
      }

      setStreams(streamsRes.data || []);
      setRecentEntries(historyRes.data?.slice(0, 5) || []);

    } catch (err) {
      console.error("Data load failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const addNewItem = () => {
    const newItem = {
      description: '',
      hours: 1,
      streamId: streams.length > 0 ? streams[0].id : '',
      points: 10,
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

  const saveEntry = async () => {
    try {
      setSaving(true);
      const entryToSave = {
        ...currentEntry,
        date: selectedDate,
        totalPoints: currentEntry?.items?.reduce((acc, i) => acc + (i.points || 0), 0) || 0
      };

      if (currentEntry.id) {
        await workDoneAPI.updateEntry(currentEntry.id, entryToSave);
      } else {
        const res = await workDoneAPI.createEntry(entryToSave);
        setCurrentEntry(res.data);
      }
      // Refresh history
      const history = await workDoneAPI.getAllEntries();
      setRecentEntries(history.data?.slice(0, 5) || []);

    } catch (err) {
      console.error(err);
      setError("Failed to save log.");
    } finally {
      setSaving(false);
    }
  };


  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  if (loading) return <div className="loading">Opening Logbook...</div>;

  return (
    <div className="workdone-page">
      <div className="school-logbook-container">

        {/* Left Page: Cover / Summary */}
        <div className="logbook-page left-page">
          <div className="page-content">
            <div className="logbook-header">
              <h2>Daily Record</h2>
              <div className="date-group">
                <span className="log-day">{getDayOfWeek(selectedDate)}</span>
                <span className="log-date">{selectedDate}</span>
              </div>
            </div>

            <div className="quote-section">
              <p>"Persist until you succeed."</p>
            </div>

            <div className="recent-memos">
              <h3>Recent Memos</h3>
              <ul>
                {recentEntries.map(e => (
                  <li key={e.id} onClick={() => setSelectedDate(e.date)} className={e.date === selectedDate ? 'active-memo' : ''}>
                    <span className="memo-date">{e.date.slice(5)}</span>
                    <span className="memo-sat">{'★'.repeat(e.satisfactionLevel)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Page: The Work Log */}
        <div className="logbook-page right-page">
          <div className="paper-texture">
            <div className="table-header-row">
              <span className="col-task">Task Description</span>
              <span className="col-stream">Stream</span>
              <span className="col-hours">Hrs</span>
              <span className="col-action"></span>
            </div>

            <div className="ruled-lines">
              {currentEntry.items.map((item, idx) => (
                <div key={idx} className="log-row">
                  <input
                    type="text"
                    className="handwritten-input task-input"
                    value={item.description}
                    onChange={e => updateItem(idx, 'description', e.target.value)}
                    placeholder="Write task..."
                  />
                  <select
                    className="handwritten-select"
                    value={item.streamId}
                    onChange={e => updateItem(idx, 'streamId', e.target.value)}
                  >
                    <option value="">Select Stream</option>
                    {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input
                    type="number"
                    className="handwritten-input hours-input"
                    value={item.hours}
                    onChange={e => updateItem(idx, 'hours', parseFloat(e.target.value))}
                  />
                  <button onClick={() => removeItem(idx)} className="ink-btn-delete"><Trash2 size={14} /></button>
                </div>
              ))}
              {/* Empty lines for visual effect */}
              {[...Array(Math.max(0, 8 - currentEntry.items.length))].map((_, i) => (
                <div key={`empty-${i}`} className="log-row empty-row"></div>
              ))}
            </div>

            <button onClick={addNewItem} className="ink-btn-add">+ Add Record</button>

            <div className="footer-satisfaction">
              <span>Satisfaction:</span>
              <div className="stars-input">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    size={24}
                    onClick={() => setCurrentEntry(prev => ({ ...prev, satisfactionLevel: s }))}
                    fill={s <= currentEntry.satisfactionLevel ? "#d97706" : "none"}
                    stroke="#d97706"
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>

            <button onClick={saveEntry} className="stamp-save-btn">
              {saving ? 'Saving...' : 'SAVE LOG'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkDonePage;