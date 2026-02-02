import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, Award, Target, MessageSquare, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { answersAPI } from '../services/api';
import './AnswerWritingPage.css'; // Consistent styling

const AnswerReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [review, setReview] = useState({
        score: '',
        feedback: '',
        verdict: 'GOOD'
    });
    const [existingReview, setExistingReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const subRes = await answersAPI.getSubmission(id);
                setSubmission(subRes.data);

                const revRes = await answersAPI.getReview(id);
                if (revRes.data) {
                    setExistingReview(revRes.data);
                    setReview(revRes.data);
                }
            } catch (error) {
                console.error('Error fetching submission details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await answersAPI.submitReview(id, review);
            setMessage({ type: 'success', text: 'Review submitted successfully!' });
            setExistingReview(review);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to submit review.' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (loading) return <div className="loading">Loading Submission...</div>;
    if (!submission) return <div className="hub-container"><div className="glass-panel">Submission not found.</div></div>;

    const downloadUrl = answersAPI.getDownloadUrl(submission.pdfPath);

    return (
        <div className="hub-container">
            <header className="hub-header">
                <button className="back-link" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Back to Hub
                </button>
                <div className="header-title" style={{ marginTop: '1rem' }}>
                    <Award className="header-icon" />
                    <h1>Review Submission</h1>
                </div>
            </header>

            <div className="review-grid-layout">
                <div className="submission-preview glass-panel">
                    <div className="preview-header">
                        <span className="subject-tag">Attempt Detail</span>
                        <div className="meta-pills">
                            <span className="pill"><ClockIcon size={14} /> {submission.timeTaken}m</span>
                            <span className="pill">{submission.submittedAt}</span>
                        </div>
                    </div>
                    <h2 className="q-full-text">{submission.questionText}</h2>

                    <div className="pdf-display-area">
                        <FileText size={64} className="pdf-large-icon" />
                        <h3>Answer PDF</h3>
                        <p>Document: {submission.pdfPath}</p>
                        <a href={downloadUrl} className="download-btn-lg" target="_blank" rel="noopener noreferrer">
                            <Download size={20} /> Download for Review
                        </a>
                    </div>
                </div>

                <div className="grading-panel glass-panel">
                    <div className="panel-header">
                        <MessageSquare className="panel-icon" />
                        <h2>{existingReview ? 'Review Summary' : 'Grade Submission'}</h2>
                    </div>

                    <form onSubmit={handleReviewSubmit} className="grading-form">
                        <div className="form-group">
                            <label>Score (Out of 10)</label>
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="10"
                                value={review.score}
                                onChange={e => setReview({ ...review, score: e.target.value })}
                                disabled={!!existingReview}
                                placeholder="e.g. 7.5"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Feedback & Comments</label>
                            <textarea
                                placeholder="Provide detailed feedback on structure, content, and language..."
                                value={review.feedback}
                                onChange={e => setReview({ ...review, feedback: e.target.value })}
                                disabled={!!existingReview}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Verdict</label>
                            <select
                                value={review.verdict}
                                onChange={e => setReview({ ...review, verdict: e.target.value })}
                                disabled={!!existingReview}
                            >
                                <option value="EXCELLENT">Excellent</option>
                                <option value="GOOD">Good Effort</option>
                                <option value="AVERAGE">Average / Satisfactory</option>
                                <option value="REWRITE">Needs Rewrite</option>
                            </select>
                        </div>

                        {!existingReview && (
                            <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Posting...' : 'Submit Grade'}
                            </button>
                        )}

                        {message && (
                            <div className={`form-message ${message.type}`}>
                                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                {message.text}
                            </div>
                        )}

                        {existingReview && (
                            <div className="review-date-stamp">
                                Graded on {existingReview.reviewedAt}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

// Internal ClockIcon proxy to avoid import error if lucide-react name mismatch
const ClockIcon = ({ size }) => <ClockIconBrand size={size} />;
const ClockIconBrand = require('lucide-react').Clock;

export default AnswerReviewPage;
