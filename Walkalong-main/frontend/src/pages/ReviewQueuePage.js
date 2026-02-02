import React, { useState, useEffect } from 'react';
import { ClipboardList, Star, ExternalLink, Calendar } from 'lucide-react';
import { answersAPI } from '../services/api';
import { Link } from 'react-router-dom';
import './AnswerWritingPage.css';

const ReviewQueuePage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await answersAPI.getMySubmissions();
                // Filter for "SUBMITTED" status in a real review queue logic
                // For this app, let's show all that need review
                setSubmissions(res.data.filter(s => s.status === 'SUBMITTED'));
            } catch (error) {
                console.error("Error fetching queue", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    if (loading) return <div className="loading">Loading Queue...</div>;

    return (
        <div className="hub-container">
            <header className="hub-header">
                <div className="header-title">
                    <ClipboardList className="header-icon" />
                    <h1>Review Queue</h1>
                </div>
                <p>Grade your attempts and provide valuable feedback.</p>
            </header>

            <div className="queue-list grid">
                {submissions.length === 0 ? (
                    <div className="empty-state glass-panel">
                        <Star size={48} />
                        <p>All clear! No assessments pending.</p>
                    </div>
                ) : (
                    submissions.map(sub => (
                        <div key={sub.id} className="queue-card glass-panel">
                            <div className="queue-card-content">
                                <h3>{sub.questionText}</h3>
                                <div className="queue-meta">
                                    <span><Calendar size={14} /> {sub.submittedAt}</span>
                                    <span><Star size={14} /> Time: {sub.timeTaken}m</span>
                                </div>
                            </div>
                            <Link to={`/submission/${sub.id}`} className="review-btn">
                                Grade Now <ExternalLink size={16} />
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewQueuePage;
