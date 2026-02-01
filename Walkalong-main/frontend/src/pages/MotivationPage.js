import { Play, Upload, Quote, RefreshCw, Film, PlusCircle } from 'lucide-react';
import './MotivationPage.css';

const MotivationPage = () => {
    const [videoUrl, setVideoUrl] = useState(null);
    const [defaultQuotes] = useState([
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
    ]);
    const [userQuotes, setUserQuotes] = useState([]);
    const [currentQuote, setCurrentQuote] = useState(null);
    const [showAddQuote, setShowAddQuote] = useState(false);
    const [newQuote, setNewQuote] = useState({ text: '', author: '' });

    const allQuotes = [...defaultQuotes, ...userQuotes];

    const generateQuote = () => {
        const randomIndex = Math.floor(Math.random() * allQuotes.length);
        setCurrentQuote(allQuotes[randomIndex]);
    };

    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoUrl(url);
        }
    };

    const handleAddQuote = (e) => {
        e.preventDefault();
        if (newQuote.text && newQuote.author) {
            setUserQuotes([...userQuotes, newQuote]);
            setNewQuote({ text: '', author: '' });
            setShowAddQuote(false);
            // Switch to the newly added quote
            setCurrentQuote(newQuote);
        }
    };

    // Initialize first quote if null
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
                    <h2>Visual Fuel</h2>
                    <div className="video-player-container">
                        {videoUrl ? <video key={videoUrl} controls src={videoUrl} className="motivation-video" /> : <div className="video-placeholder">Upload a video</div>}
                    </div>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} />
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
                                    <p className="quote-author">— {currentQuote.author}</p>
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
