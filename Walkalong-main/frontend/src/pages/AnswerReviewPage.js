import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, Award, Target, AlertTriangle, Lightbulb, CheckCircle, ArrowLeft } from 'lucide-react';
import { answersAPI } from '../services/api';
import './AnswerReviewPage.css';

const AnswerReviewPage = () => {
    const { id } = useParams();
    const [submission, setSubmission] = useState(null);
    const [review, setReview] = useState({
        score: 0,
        strengths: '',
        weaknesses: '',
        suggestions: '',
        verdict: 'AVERAGE'
    });
    const [existingReview, setExistingReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const subRes = await answersAPI.getSubmission(id);
            setSubmission(subRes.data);

            try {
                const revRes = await answersAPI.getReview(id);
                if (revRes.data) {
                    setExistingReview(revRes.data);
                    setReview(revRes.data);
                }
            } catch (e) {
                // No review yet
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await answersAPI.submitReview(id, review);
            setMessage({ type: 'success', text: 'Review submitted successfully!' });
            setExistingReview(review);
            // Refresh to get full saved object if needed
            fetchData();
        } catch (error) {
            console.error('Error submitting review:', error);
            setMessage({ type: 'error', text: 'Failed to submit review.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="loader-container">Loading submission...</div>;
    if (!submission) return <div className="error-container">Submission not found.</div>;

    const downloadUrl = answersAPI.getDownloadUrl(submission.pdfPath);

    return (
        <div className="review-page-container">
            <div className="page-header">
                <button className="back-btn" onClick={() => window.history.back()}>
                    <ArrowLeft size={18} /> Back
                </button>
                <h1>Submission Detail</h1>
            </div>

            <div className="review-grid">
                <div className="submission-content glass-panel">
                    <div className="content-section">
                        <span className="section-label">Question</span>
                        <div className="question-box">
                            <span className="badge subject">{submission.question.subject}</span>
                            <h3>{submission.question.questionText}</h3>
                        </div>
                    </div>

                    <div className="content-section">
                        <span className="section-label">Answer Document</span>
                        <div className="pdf-viewer-placeholder">
                            <FileText size={48} className="pdf-icon" />
                            <p>Download the PDF to review the handwritten answer.</p>
                            <a href={downloadUrl} className="download-btn" target="_blank" rel="noopener noreferrer">
                                <Download size={18} /> Download Answer PDF
                            </a>
                        </div>
                    </div>

                    <div className="meta-info">
                        <div className="meta-item">
                            <span className="label">Submitted At</span>
                            <span className="value">{new Date(submission.submittedAt).toLocaleString()}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Time Taken</span>
                            <span className="value">{submission.timeTakenMinutes} minutes</span>
                        </div>
                    </div>
                </div>

                <div className="review-form-container glass-panel">
                    <div className="section-header">
                        <Award className="header-icon" />
                        <h2>{existingReview ? 'Feedback & Scores' : 'Submit Review'}</h2>
                    </div>

                    <form onSubmit={handleReviewSubmit}>
                        <div className="form-group">
                            <label>Score (0-10)</label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={review.score}
                                onChange={e => setReview({ ...review, score: parseInt(e.target.value) })}
                                disabled={!!existingReview}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><CheckCircle size={14} /> Strengths</label>
                            <textarea
                                placeholder="What went well?"
                                value={review.strengths}
                                onChange={e => setReview({ ...review, strengths: e.target.value })}
                                disabled={!!existingReview}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><AlertTriangle size={14} /> Weaknesses</label>
                            <textarea
                                placeholder="Where can they improve?"
                                value={review.weaknesses}
                                onChange={e => setReview({ ...review, weaknesses: e.target.value })}
                                disabled={!!existingReview}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><Lightbulb size={14} /> Suggestions</label>
                            <textarea
                                placeholder="Concrete steps for improvement..."
                                value={review.suggestions}
                                onChange={e => setReview({ ...review, suggestions: e.target.value })}
                                disabled={!!existingReview}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><Target size={14} /> Verdict</label>
                            <select
                                value={review.verdict}
                                onChange={e => setReview({ ...review, verdict: e.target.value })}
                                disabled={!!existingReview}
                                className="verdict-select"
                            >
                                <option value="REWRITE">Needs Rewrite</option>
                                <option value="AVERAGE">Average</option>
                                <option value="GOOD">Good</option>
                                <option value="EXCELLENT">Excellent</option>
                            </select>
                        </div>

                        {message.text && (
                            <div className={`message-banner ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        {!existingReview && (
                            <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AnswerReviewPage;
