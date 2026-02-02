import React, { useState, useEffect, useRef } from 'react';
import { Play, Upload, Quote, RefreshCw, Film, PlusCircle, Trash2 } from 'lucide-react';
import './MotivationPage.css';

// IndexedDB Helper for Video Persistence
const DB_NAME = 'MotivationDB';
const STORE_NAME = 'Videos';

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const saveVideoToDB = async (blob) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, 'motivationVideo');
    return tx.complete;
};

const getVideoFromDB = async () => {
    const db = await initDB();
    return new Promise((resolve) => {
        const request = db.transaction(STORE_NAME).objectStore(STORE_NAME).get('motivationVideo');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
    });
};

const MotivationPage = () => {
    const [videoUrl, setVideoUrl] = useState(null);
    const [defaultQuotes] = useState([
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
    ]);
    const [userQuotes, setUserQuotes] = useState(() => {
        const saved = localStorage.getItem('userQuotes');
        return saved ? JSON.parse(saved) : [];
    });
    const [currentQuote, setCurrentQuote] = useState(null);
    const [showAddQuote, setShowAddQuote] = useState(false);
    const [newQuote, setNewQuote] = useState({ text: '', author: '' });
    const videoRef = useRef(null);

    useEffect(() => {
        // Load persistend video
        const loadVideo = async () => {
            const blob = await getVideoFromDB();
            if (blob) {
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
            }
        };
        loadVideo();
    }, []);

    useEffect(() => {
        localStorage.setItem('userQuotes', JSON.stringify(userQuotes));
    }, [userQuotes]);

    const allQuotes = [...defaultQuotes, ...userQuotes];

    const generateQuote = () => {
        const randomIndex = Math.floor(Math.random() * allQuotes.length);
        setCurrentQuote(allQuotes[randomIndex]);
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoUrl(url);
            await saveVideoToDB(file);
        }
    };

    const handleAddQuote = (e) => {
        e.preventDefault();
        if (newQuote.text && newQuote.author) {
            const updated = [...userQuotes, newQuote];
            setUserQuotes(updated);
            setNewQuote({ text: '', author: '' });
            setShowAddQuote(false);
            setCurrentQuote(newQuote);
        }
    };

    const deleteUserQuote = (index) => {
        const updated = userQuotes.filter((_, i) => i !== index);
        setUserQuotes(updated);
        if (currentQuote === userQuotes[index]) {
            setCurrentQuote(allQuotes[0]);
        }
    };

    if (!currentQuote && allQuotes.length > 0) {
        setCurrentQuote(allQuotes[0]);
    }

    return (
        <div className="motivation-container">
            <header className="motivation-header">
                <h1>Motivation Hub</h1>
                <p>Fuel your ambition with visual and mental sparks.</p>
            </header>

            <div className="motivation-grid">
                <div className="motivation-section video-section card">
                    <div className="section-header">
                        <h2>Visual Fuel</h2>
                        <label className="upload-label">
                            <Upload size={16} /> Update Video
                            <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <div className="video-player-container">
                        {videoUrl ? (
                            <video key={videoUrl} controls src={videoUrl} className="motivation-video" ref={videoRef} />
                        ) : (
                            <div className="video-placeholder">
                                <Film size={48} />
                                <p>No video uploaded</p>
                                <label className="upload-btn-lg">
                                    Upload Motivation
                                    <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} />
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="motivation-section quote-section card">
                    <div className="section-header">
                        <h2>Mental Spark</h2>
                        <button className="add-quote-trigger" onClick={() => setShowAddQuote(!showAddQuote)}>
                            <PlusCircle size={18} /> Add Your Own
                        </button>
                    </div>

                    {showAddQuote ? (
                        <form className="add-quote-form" onSubmit={handleAddQuote}>
                            <textarea
                                placeholder="Enter a life-changing quote..."
                                value={newQuote.text}
                                onChange={e => setNewQuote({ ...newQuote, text: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Author"
                                value={newQuote.author}
                                onChange={e => setNewQuote({ ...newQuote, author: e.target.value })}
                                required
                            />
                            <div className="form-actions">
                                <button type="submit" className="save-quote-btn">Save Spark</button>
                                <button type="button" className="cancel-quote-btn" onClick={() => setShowAddQuote(false)}>Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="quote-display-box">
                            {currentQuote && (
                                <>
                                    <p className="quote-text">"{currentQuote.text}"</p>
                                    <div className="quote-author-row">
                                        <p className="quote-author">— {currentQuote.author}</p>
                                        {userQuotes.includes(currentQuote) && (
                                            <button
                                                className="quote-delete-btn"
                                                onClick={() => deleteUserQuote(userQuotes.indexOf(currentQuote))}
                                                title="Delete this quote"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <button className="shuffle-btn" onClick={generateQuote}>
                        <RefreshCw size={18} /> Shuffle Quote
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MotivationPage;
