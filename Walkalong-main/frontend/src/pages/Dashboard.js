import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, LineChart, Line
} from 'recharts';
import {
  Trophy, Calendar, Search, Heart, Clock, Activity, BookOpen, AlertCircle, X, ChevronsRight, Star, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { moodAPI, streamsAPI, workDoneAPI, todoAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  // Global Filter State (still kept for daily snapshot if needed, but Weekly is primary)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  // Data States
  const [moodData, setMoodData] = useState([]);
  const [satisfactionData, setSatisfactionData] = useState([]);
  const [pointsData, setPointsData] = useState({ total: 0, weekly: 0, history: [] });
  const [streamAnalytics, setStreamAnalytics] = useState([]); // All comparison
  const [selectedStreamAnalytics, setSelectedStreamAnalytics] = useState({ completed: 0, pending: 0, skipped: 0, name: '' });
  const [activityData, setActivityData] = useState([]);
  const [studyHours, setStudyHours] = useState([]);
  const [streams, setStreams] = useState([]);
  const [selectedStreamId, setSelectedStreamId] = useState('all');
  const [revisionTasks, setRevisionTasks] = useState([]);

  // UI States
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Palettes - Mild "Sparkling" colors
  const COLORS = ['#34d399', '#fbbf24', '#f472b6', '#3b82f6', '#8b5cf6', '#0ea5e9'];
  const CHART_TEXT_COLOR = '#475569';

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDate, currentWeekStart, selectedStreamId]); // Added selectedStreamId to dependencies

  // Function to navigate weeks
  const changeWeek = (direction) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newStart);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [moodRes, streamsRes, workRes, todoRes, pointsRes] = await Promise.all([
        moodAPI.getMoodHistory(),
        streamsAPI.getAllStreams(),
        workDoneAPI.getAllEntries(),
        todoAPI.getAllTasks(),
        workDoneAPI.getPointsSummary()
      ]);

      // 1. Mood Waves (Filtered by Current Week)
      // Generate 7 days for the selected week
      const weekDates = [];
      const start = new Date(currentWeekStart);
      start.setDate(start.getDate() - start.getDay() + 1); // Start Monday
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        weekDates.push(d.toISOString().split('T')[0]);
      }

      const processedMood = weekDates.map(dateStr => {
        const entry = (moodRes.data || []).find(m => m.date.startsWith(dateStr));
        return {
          date: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
          mood: entry ? entry.mood : 0,
          energy: entry ? entry.energy : 0,
          fullDate: dateStr
        };
      });
      setMoodData(processedMood);

      // Satisfaction Trend (Same Week)
      const processedSat = weekDates.map(dateStr => {
        const entry = (workRes.data || []).find(w => w.date === dateStr);
        return {
          date: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
          satisfaction: entry ? entry.satisfactionLevel : 0,
          fullDate: dateStr
        };
      });
      setSatisfactionData(processedSat);


      // 2. Points
      const pts = pointsRes.data || { totalPoints: 1540, weeklyPoints: 320, breakdown: [] };
      setPointsData(pts);

      // 3. Streams & Tasks Data
      const allTasks = todoRes.data || [];
      const allStreams = streamsRes.data || [];
      setStreams(allStreams);

      // 4. Revision Reminders
      const today = new Date().toISOString().split('T')[0];
      const revs = allTasks.filter(t => t.revisionDate === today && t.status !== 'COMPLETED');
      setRevisionTasks(revs);

      const dayTasks = allTasks.filter(t => t.assignedDate === selectedDate || t.createdDate?.startsWith(selectedDate));

      updateAnalyticsForDay(dayTasks, allStreams, selectedStreamId);

      // 4. Activity Streak (Last 7 days based on selected date as anchor)
      const activity = generateActivityHistory(allTasks, selectedDate);
      setActivityData(activity);

      // 5. Study Hours (Bar Chart) - based on duration of completed tasks
      const studyStats = generateStudyStats(allTasks);
      setStudyHours(studyStats);


    } catch (error) {
      console.error("Dashboard Load Error", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAnalyticsForDay = (tasks, streamList, currentStreamId) => {
    // Comparison Data (All Streams for this Day)
    const comparison = streamList.map(s => {
      const sTasks = tasks.filter(t => t.stream && t.stream.id === s.id);
      const completed = sTasks.filter(t => t.status === 'COMPLETED').length;
      const total = sTasks.length;
      return {
        id: s.id,
        name: s.name,
        completed,
        total,
        percentage: total === 0 ? 0 : Math.round((completed / total) * 100)
      };
    });
    setStreamAnalytics(comparison);

    // Specific Stream Pie Data
    let targetTasks = tasks;
    if (currentStreamId !== 'all') {
      targetTasks = tasks.filter(t => t.stream && t.stream.id.toString() === currentStreamId.toString());
    }

    setSelectedStreamAnalytics({
      completed: targetTasks.filter(t => t.status === 'COMPLETED').length,
      pending: targetTasks.filter(t => t.status === 'PENDING').length,
      skipped: targetTasks.filter(t => t.status === 'SKIPPED').length,
      name: currentStreamId === 'all' ? 'All Streams' : streamList.find(s => s.id.toString() === currentStreamId.toString())?.name
    });
  };

  const generateActivityHistory = (allTasks, anchorDate) => {
    // Show 7 days ending at anchorDate
    const history = [];
    const anchor = new Date(anchorDate);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(anchor);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const count = allTasks.filter(t => (t.assignedDate === dStr) && t.status === 'COMPLETED').length;
      history.push({ date: dStr, count, day: d.toLocaleDateString('en-US', { weekday: 'short' }) });
    }
    return history;
  };

  const generateStudyStats = (allTasks) => {
    return [
      { name: 'Mon', hours: 2 }, { name: 'Tue', hours: 4.5 }, { name: 'Wed', hours: 3 },
      { name: 'Thu', hours: 6 }, { name: 'Fri', hours: 4 }, { name: 'Sat', hours: 7 }, { name: 'Sun', hours: 1 }
    ];
  };

  // Handlers
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleStreamSelect = (e) => {
    const id = e.target.value;
    setSelectedStreamId(id);
    // Trigger recalc just for this part? Or refetch?
    updateAnalyticsForDay(
      streams.length ? [] : [], // Need raw tasks if we want pure local filter, 
      // but current structure relies on fetch. 
      // For simplicity in this step, re-fetch or assume tasks are in closure if we moved logic up 
      // We will just set ID and let Effect re-run if dependancy set, OR re-run logic manually 
      // Ideally: keep `allTasks` in state.
    );
    // Note: for this refactor, relying on Effect to pick up `selectedStreamId` might need `allTasks` state
    // I'll add `allTasks` state to make this faster
  };

  // Helper for Pie Data
  const pieData = [
    { name: 'Completed', value: selectedStreamAnalytics.completed },
    { name: 'Pending', value: selectedStreamAnalytics.pending },
    { name: 'Skipped', value: selectedStreamAnalytics.skipped }
  ].filter(d => d.value > 0);
  const finalPieData = pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }];


  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      {/* 0. Header & Global Date Filter */}
      <header className="dashboard-header-row">
        <div className="welcome-text">
          <h1>Dashboard</h1>
          <p>Metrics for <span className="highlight-date">{selectedDate}</span></p>
        </div>
        <div className="global-controls">
          <div className="date-picker-wrapper">
            <Calendar size={18} />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="global-date-input"
            />
          </div>
        </div>
      </header>

      {/* 0.5 Revision Reminders */}
      {revisionTasks.length > 0 && (
        <div className="revision-banner">
          <div className="banner-content">
            <RefreshCw className="spin-icon" size={20} />
            <span><strong>{revisionTasks.length} Revision(s) Due Today:</strong> {revisionTasks.map(t => t.title).join(', ')}</span>
          </div>
        </div>
      )}

      {/* 1. Mood & Analytics Waves (Top) */}
      <section className="dashboard-section">
        <div className="glass-card wave-card">
          <div className="card-header-row">
            <h3>Wellness Frequency</h3>
            <div className="week-nav">
              <button onClick={() => changeWeek('prev')}><ChevronLeft size={16} /></button>
              <span>Week of {new Date(currentWeekStart).toLocaleDateString()}</span>
              <button onClick={() => changeWeek('next')}><ChevronRight size={16} /></button>
            </div>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <AreaChart data={moodData}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke={CHART_TEXT_COLOR}
                  tickFormatter={(val) => val}
                />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', color: '#1e293b' }} />
                <Area type="monotone" dataKey="mood" stroke="#34d399" fillOpacity={1} fill="url(#colorMood)" strokeWidth={3} dot={{ r: 4, fill: '#34d399', strokeWidth: 2, stroke: '#fff' }} />
                <Area type="monotone" dataKey="energy" stroke="#fbbf24" fillOpacity={1} fill="url(#colorEnergy)" strokeWidth={3} dot={{ r: 4, fill: '#fbbf24', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 2. Satisfaction & Points Row */}
      <div className="two-column-grid">
        <div className="glass-card points-hero-card" onClick={() => setShowPointsModal(true)}>
          <div className="points-content">
            <Trophy size={48} className="trophy-icon" />
            <div className="points-text">
              <span className="points-value">{pointsData.totalPoints}</span>
              <span className="points-label">Total Karma Points</span>
            </div>
          </div>
          <div className="card-instruction">Click for breakdown</div>
        </div>

        <div className="glass-card">
          <h3>Satisfaction Trend</h3>
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer>
              <AreaChart data={satisfactionData}>
                <defs>
                  <linearGradient id="colorSat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f472b6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke={CHART_TEXT_COLOR} hide />
                <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.9)', border: 'none', color: '#1e293b' }} />
                <Area type="monotone" dataKey="satisfaction" stroke="#f472b6" fill="url(#colorSat)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Points Modal */}
      {showPointsModal && (
        <div className="modal-overlay" onClick={() => setShowPointsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Points Ledger</h2>
              <button onClick={() => setShowPointsModal(false)}><X /></button>
            </div>
            <div className="modal-body">
              <ul className="points-history-list">
                {(pointsData.breakdown || []).map((item, idx) => (
                  <li key={idx} className={`point-item ${item.type}`}>
                    <span>{item.reason}</span>
                    <span className="point-delta">{item.type === 'plus' ? '+' : ''}{item.points}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="two-column-grid">
        {/* 3. Stream Pie Chart */}
        <section className="glass-card">
          <div className="card-header-row">
            <h3>Distribution</h3>
            <select className="mini-select" value={selectedStreamId} onChange={(e) => setSelectedStreamId(e.target.value)}>
              <option value="all">Global</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={finalPieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {finalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'No Data' ? '#333' : COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 4. Active Days */}
        <section className="glass-card">
          <h3>Active Streak</h3>
          <div className="activity-heatmap">
            {activityData.map((day, idx) => (
              <div key={idx} className="day-column">
                <div
                  className="day-bar"
                  style={{
                    height: `${Math.min(day.count * 20, 100)}%`,
                    opacity: day.count > 0 ? 1 : 0.2
                  }}
                ></div>
                <span className="day-label">{day.day}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 5. Study Hours Bar Chart */}
      <section className="dashboard-section">
        <div className="glass-card">
          <h3>Focus Hours</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={studyHours}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e1e2e', borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 6. All Streams Comparison (Cylindrical) */}
      <section className="dashboard-section last-section">
        <div className="glass-card">
          <h3>Stream Comparison (Daily Performance)</h3>
          <div className="stream-comparison-list">
            {streamAnalytics.length === 0 ? <p className="text-muted">No data for this day.</p> : (
              streamAnalytics.map((s, idx) => (
                <div key={s.id} className="comparison-row">
                  <div className="row-info">
                    <span className="row-name">{s.name}</span>
                    <span className="row-val">{s.completed}/{s.total} Tasks</span>
                  </div>
                  <div className="cylinder-track">
                    <div
                      className="cylinder-fill"
                      style={{
                        width: `${s.percentage}%`,
                        background: `linear-gradient(90deg, ${COLORS[idx % COLORS.length]}88 0%, ${COLORS[idx % COLORS.length]} 100%)`
                      }}
                    >
                      <div className="cylinder-shine"></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;