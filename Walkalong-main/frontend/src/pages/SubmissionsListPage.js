import React, { useState, useEffect } from 'react';
import { FileText, Eye, Clock, Award, ChevronRight, Hash } from 'lucide-react';
import { answersAPI } from '../services/api';
import './AnswerWritingPage.css'; // Consistent styling

const SubmissionsListPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await answersAPI.getMySubmissions();
                setSubmissions(res.data);
            } catch (error) {
                console.error('Error fetching submissions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    const getStatusBadge = (status) => {
        const labels = {
            'REVIEWED': { label: 'REVIEWED', class: 'REVIEWED' },
            'SUBMITTED': { label: 'PENDING', class: 'SUBMITTED' }
        };
        const s = labels[status] || { label: status, class: 'NOT_ATTEMPTED' };
        return <span className={`status-badge ${s.class}`}>{s.label}</span>;
    };

    if (loading) return <div className="loading">Loading History...</div>;

    return (
        <div className="hub-container">
            <header className="hub-header">
                <div className="header-title">
                    <FileText className="header-icon" />
                    <h1>My Submissions</h1>
                </div>
                <p>History of all your attempts and feedback received.</p>
            </header>

            <div className="glass-panel submission-history">
                <div className="table-responsive">
                    <table className="clean-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Question</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Result</th>
                                <th>View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-cell">No submissions yet. Attempt a question to see it here!</td>
                                </tr>
                            ) : (
                                submissions.map(sub => (
                                    <tr key={sub.id} className="history-row">
                                        <td className="date-cell">{sub.submittedAt}</td>
                                        <td className="q-preview-cell" title={sub.questionText}>
                                            {sub.questionText}
                                        </td>
                                        <td className="time-cell">
                                            <div className="time-info">
                                                <Clock size={14} /> {sub.timeTaken}m
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(sub.status)}</td>
                                        <td className="score-cell">
                                            {sub.review ? (
                                                <div className="result-chip">
                                                    <Award size={14} /> {sub.review.score}/10
                                                </div>
                                            ) : (
                                                <span className="wait-text">Awaiting</span>
                                            )}
                                        </td>
                                        <td className="action-cell">
                                            <button
                                                className="view-btn-icon"
                                                onClick={() => window.location.href = `/submission/${sub.id}`}
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubmissionsListPage;
