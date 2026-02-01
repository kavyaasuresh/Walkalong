import React, { useState, useEffect } from 'react';
import { workDoneAPI } from '../services/api';
import { Book, Star } from 'lucide-react';
import './WorkDonePage.css';

const WorkDonePage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await workDoneAPI.getAllEntries();
      // Mock data if empty for visualization
      const data = (res.data && res.data.length > 0) ? res.data : [
        { id: 1, date: '2023-10-24', tasks: ['React Components', 'API Integration'], satisfaction: 5, notes: 'Great progress today!' },
        { id: 2, date: '2023-10-23', tasks: ['CSS Grid'], satisfaction: 3, notes: 'Struggled with layout.' }
      ];
      setEntries(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-container">
      <div className="book-spine"></div>
      <div className="book-page left-page">
        <header className="journal-header">
          <h1>Work Journal</h1>
          <p>Reflections & Records</p>
        </header>
        <div className="journal-intro">
          <Book size={40} className="journal-icon" />
          <p>"Discipline is the bridge between goals and accomplishment."</p>
        </div>
      </div>

      <div className="book-page right-page">
        <div className="entries-list">
          {entries.map((entry, idx) => (
            <div key={entry.id} className="journal-entry">
              <div className="entry-date">{entry.date}</div>
              <div className="entry-content">
                <ul className="entry-tasks">
                  {entry.tasks && entry.tasks.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
                {entry.notes && <p className="entry-notes">"{entry.notes}"</p>}
                <div className="entry-satisfaction">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < entry.satisfaction ? "#f59e0b" : "none"}
                      stroke={i < entry.satisfaction ? "#f59e0b" : "#94a3b8"}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkDonePage;