import React, { useState } from 'react';
import { Play, Upload, Quote, RefreshCw, Film } from 'lucide-react';
import './MotivationPage.css';

const MotivationPage = () => {
    const [videoUrl, setVideoUrl] = useState(null);
    const [currentQuote, setCurrentQuote] = useState({ text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" });

    const quotes = [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
    ];

    const generateQuote = () => {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        setCurrentQuote(quotes[randomIndex]);
    };

    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoUrl(url);
        }
    };

    return (
        <div className="motivation-container">
            <header className="motivation-header">
                <h1>Motivation Hub</h1>
                <p>Fuel your ambition with visual and mental sparks.</p>
            </header>

            <div className="motivation-grid">
                <div className="motivation-section video-section card">
                    <h2>Visual Fuel</h2>
                    <div className="video-player-container">
                        {videoUrl ? <video key={videoUrl} controls src={videoUrl} className="motivation-video" /> : <div className="video-placeholder">Upload a video</div>}
                    </div>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} />
                </div>

                <div className="motivation-section quote-section card">
                    <h2>Mental Spark</h2>
                    <div className="quote-display-box">
                        <p className="quote-text">"{currentQuote.text}"</p>
                        <p className="quote-author">— {currentQuote.author}</p>
                    </div>
                    <button className="shuffle-btn" onClick={generateQuote}>
                        <RefreshCw size={18} /> Shuffle Quote
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MotivationPage;
