import React, { useState, useEffect } from 'react';
import { Layers, PlusCircle, Upload, CheckCircle, Clock as ClockIcon, ExternalLink, RefreshCw } from 'lucide-react';
import { answersAPI } from '../services/api';
import './AnswerWritingPage.css'; // Reuse some styles or create new ones

const QuestionBarPage = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [uploadData, setUploadData] = useState({ timeTaken: '', file: null });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const res = await answersAPI.getQuestions();
            // In a real app, we'd fetch status per question. Mock logic handles this.
            setQuestions(res.data);
        } catch (error) {
            console.error("Error fetching questions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadClick = (q) => {
        setSelectedQuestion(q);
        setShowUploadModal(true);
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadData.file) return;

        const formData = new FormData();
        formData.append('questionId', selectedQuestion.id);
        formData.append('file', uploadData.file);
        formData.append('timeTaken', uploadData.timeTaken);

        try {
            await answersAPI.submitAnswer(formData);
            setShowUploadModal(false);
            setUploadData({ timeTaken: '', file: null });
            fetchQuestions(); // Refresh to show status update
        } catch (error) {
            console.error("Upload failed", error);
        }
    };

    if (loading) return <div className="loading">Loading Hub...</div>;

    return (
        <div className="hub-container">
            <header className="hub-header">
                <div className="header-title">
                    <Layers className="header-icon" />
                    <h1>Question Bar</h1>
                </div>
                <p>Track your preparation and upload your attempts here.</p>
            </header>

            <div className="question-grid">
                {questions.length === 0 ? (
                    <div className="empty-state glass-panel">
                        <PlusCircle size={48} />
                        <p>No questions created yet. Start by creating one!</p>
                    </div>
                ) : (
                    questions.map(q => (
                        <div key={q.id} className="question-hub-card glass-panel">
                            <div className="card-top">
                                <span className="subject-tag">{q.subject}</span>
                                <span className={`status-badge ${q.status || 'NOT_ATTEMPTED'}`}>
                                    {q.status ? q.status.replace('_', ' ') : 'NOT ATTEMPTED'}
                                </span>
                            </div>
                            <h3 className="question-text-short">{q.text}</h3>
                            <div className="card-footer">
                                <span className="topic-text">{q.topic}</span>
                                <button className="action-btn" onClick={() => handleUploadClick(q)}>
                                    <Upload size={16} /> Attempt
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showUploadModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel">
                        <h2>Upload Answer</h2>
                        <p className="q-preview">"{selectedQuestion?.text}"</p>
                        <form onSubmit={handleUploadSubmit}>
                            <div className="form-group">
                                <label>PDF File</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setUploadData({ ...uploadData, file: e.target.files[0] })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Time Taken (minutes)</label>
                                <input
                                    type="number"
                                    value={uploadData.timeTaken}
                                    onChange={e => setUploadData({ ...uploadData, timeTaken: e.target.value })}
                                    placeholder="e.g. 15"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="submit-btn">Submit Answer</button>
                                <button type="button" className="cancel-btn" onClick={() => setShowUploadModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBarPage;
