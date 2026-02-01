import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, BarChart2, PieChart as PieIcon, Activity, Save } from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { streamsAPI, todoAPI } from '../services/api';
// Using inline styles for parts of this to achieve the "different style" / "free-form" look requested

const StreamDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [stream, setStream] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'analytics'

    // Mock initial notes if none exist
    const [nextNoteId, setNextNoteId] = useState(1);

    useEffect(() => {
        fetchStreamData();
    }, [id]);

    const fetchStreamData = async () => {
        try {
            // Ideally backend provides this. For now, we mock somewhat or fetch what we can.
            // Assuming we can get stream details by ID or filtering list
            const allStreams = await streamsAPI.getAllStreams();
            const currentStream = allStreams.data.find(s => s.id.toString() === id);
            setStream(currentStream || { name: 'Unknown Stream' });

            const allTasks = await todoAPI.getAllTasks();
            const streamTasks = allTasks.data.filter(t => t.stream && t.stream.id.toString() === id);
            setTasks(streamTasks);

            setLoading(false);
        } catch (e) {
            console.error("Error fetching stream detail", e);
            setLoading(false);
        }
    };

    // --- Sticky Note Logic ---
    const addNote = (x = 100, y = 100) => {
        const colors = ['#fef3c7', '#dcfce7', '#dbeafe', '#fce7f3']; // Post-it colors
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newNote = {
            id: Date.now(),
            x,
            y,
            content: 'New Idea...',
            color: randomColor,
            width: 200,
            height: 150
        };
        setNotes([...notes, newNote]);
    };

    const updateNote = (noteId, content) => {
        setNotes(notes.map(n => n.id === noteId ? { ...n, content } : n));
    };

    const deleteNote = (noteId) => {
        setNotes(notes.filter(n => n.id !== noteId));
    };

    const handleCanvasDoubleClick = (e) => {
        // Only add if clicking directly on the canvas, not a note
        if (e.target.className === 'sticky-canvas') {
            const rect = e.target.getBoundingClientRect();
            addNote(e.clientX - rect.left, e.clientY - rect.top);
        }
    };

    const handleDragStart = (e, noteId) => {
        e.dataTransfer.setData("noteId", noteId);
        // Calculate offset
        const note = notes.find(n => n.id === noteId);
        // We could store offset here if strict precision needed, simplifying for now
    };

    const handleDrop = (e) => {
        const noteId = parseInt(e.dataTransfer.getData("noteId"));
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - 100; // Center offset approx
        const y = e.clientY - rect.top - 20;

        setNotes(notes.map(n => n.id === noteId ? { ...n, x, y } : n));
        e.preventDefault();
    };

    const handleDragOver = (e) => e.preventDefault();

    // --- Analytics Data Prep ---
    const completionData = [
        { name: 'Done', value: tasks.filter(t => t.status === 'COMPLETED').length },
        { name: 'Pending', value: tasks.filter(t => t.status === 'PENDING').length },
        { name: 'Skipped', value: tasks.filter(t => t.status === 'SKIPPED').length }
    ].filter(d => d.value > 0);

    const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

    if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;

    const styles = {
        container: {
            padding: '2rem',
            height: 'calc(100vh - 80px)', // Adjust based on navbar
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
        },
        backBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '1rem'
        },
        title: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
        },
        controls: {
            display: 'flex',
            gap: '1rem',
            background: 'rgba(0,0,0,0.3)',
            padding: '5px',
            borderRadius: '2rem'
        },
        controlBtn: (active) => ({
            padding: '0.5rem 1.5rem',
            borderRadius: '1.5rem',
            border: 'none',
            background: active ? 'var(--accent-primary)' : 'transparent',
            color: active ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease'
        }),
        canvas: {
            flex: 1,
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed var(--glass-border)',
            borderRadius: '1rem',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'crosshair'
        },
        note: (note) => ({
            position: 'absolute',
            left: note.x,
            top: note.y,
            width: note.width,
            height: note.height,
            backgroundColor: note.color,
            borderRadius: '2px 2px 10px 2px', // Post-it fold
            padding: '10px',
            boxShadow: '5px 5px 15px rgba(0,0,0,0.2)',
            cursor: 'move',
            color: '#1f2937',
            transform: 'rotate(-1deg)', // Slight organic tilt
            display: 'flex',
            flexDirection: 'column'
        }),
        noteHeader: {
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '5px'
        },
        deleteNoteBtn: {
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: '#ef4444',
            opacity: 0.6
        },
        noteTextarea: {
            border: 'none',
            background: 'transparent',
            resize: 'none',
            flex: 1,
            outline: 'none',
            fontFamily: 'Caveat, cursive', // Handwritten font feel if available, else cursive
            fontSize: '1.1rem',
            lineHeight: '1.4'
        },
        analyticsGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            height: '100%'
        },
        chartCard: {
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            borderRadius: '1.5rem',
            border: '1px solid var(--glass-border)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button style={styles.backBtn} onClick={() => navigate('/streams')}>
                        <ArrowLeft size={20} /> Back
                    </button>
                    <h1 style={styles.title}>{stream?.name}</h1>
                </div>

                <div style={styles.controls}>
                    <button
                        style={styles.controlBtn(activeTab === 'notes')}
                        onClick={() => setActiveTab('notes')}
                    >
                        Logic Board
                    </button>
                    <button
                        style={styles.controlBtn(activeTab === 'analytics')}
                        onClick={() => setActiveTab('analytics')}
                    >
                        Deep Dive
                    </button>
                </div>
            </div>

            {activeTab === 'notes' && (
                <>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        * Double click anywhere to add a sticky note. Drag to clear your mind.
                    </div>
                    <div
                        className="sticky-canvas"
                        style={styles.canvas}
                        onDoubleClick={handleCanvasDoubleClick}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {notes.length === 0 && (
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'rgba(255,255,255,0.1)', fontSize: '1.5rem' }}>
                                Empty Canvas
                            </div>
                        )}
                        {notes.map(note => (
                            <div
                                key={note.id}
                                style={styles.note(note)}
                                draggable
                                onDragStart={(e) => handleDragStart(e, note.id)}
                            >
                                <div style={styles.noteHeader}>
                                    <button
                                        style={styles.deleteNoteBtn}
                                        onClick={() => deleteNote(note.id)}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <textarea
                                    style={styles.noteTextarea}
                                    value={note.content}
                                    onChange={(e) => updateNote(note.id, e.target.value)}
                                    placeholder="Write something..."
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'analytics' && (
                <div style={styles.analyticsGrid}>
                    <div style={styles.chartCard}>
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Task Distribution</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={completionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {completionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={styles.chartCard}>
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Focus Waves</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={[
                                    { name: 'Mon', uv: 20 }, { name: 'Tue', uv: 40 },
                                    { name: 'Wed', uv: 30 }, { name: 'Thu', uv: 60 },
                                    { name: 'Fri', uv: 50 }, { name: 'Sat', uv: 80 }
                                ]}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip />
                                <Area type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StreamDetail;
