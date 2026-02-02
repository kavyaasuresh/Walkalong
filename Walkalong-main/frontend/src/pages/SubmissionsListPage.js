import React, { useState, useEffect } from 'react';
import { FileText, Eye, Clock, Award, ChevronRight, RefreshCw } from 'lucide-react';
import { answersAPI } from '../services/api';
import './SubmissionsListPage.css';

const SubmissionsListPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubmissions();
    }, []);

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'REVIEWED': return 'status-success';
            case 'SUBMITTED': return 'status-warning';
            default: return 'status-default';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) return <div className="loading-container"><div className="loader"></div><p>Loading your progress...</p></div>;

    return (
        <div className="submissions-page-container">
            <div className="page-header">
                <h1>My Submissions</h1>
                <p>Track your writing journey and review feedback.</p>
            </div>

            <div className="submissions-list glass-panel">
                {submissions.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <h3>No submissions yet</h3>
                        <p>Start your first practice session to see it here.</p>
                        <button className="primary-btn" onClick={() => window.location.href = '/answer-writing'}>Start Writing</button>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="submissions-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Question</th>
                                    <th>Time Taken</th>
                                    <th>Status</th>
                                    <th>Verdict/Score</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map(sub => (
                                    <tr key={sub.id} className="submission-row">
                                        <td>{formatDate(sub.submittedAt)}</td>
                                        <td className="question-cell">
                                            <span className="q-preview" title={sub.question.questionText}>{sub.question.questionText}</span>
                                        </td>
                                        <td>
                                            <div className="time-cell">
                                                <Clock size={14} />
                                                <span>{sub.timeTakenMinutes} mins</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusColor(sub.status)}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td>
                                            {sub.status === 'REVIEWED' ? (
                                                <div className="score-cell">
                                                    <Award size={14} />
                                                    <span className="score-text">Check Review</span>
                                                </div>
                                            ) : (
                                                <span className="pending-text">Awaiting Review</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button
                                                    className="action-icon-btn"
                                                    onClick={() => window.location.href = `/submission/${sub.id}`}
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {sub.status === 'REVIEWED' && (
                                                    <button
                                                        className="action-icon-btn re-attempt"
                                                        onClick={() => window.location.href = `/answer-writing?retry=${sub.id}`}
                                                        title="Re-attempt"
                                                    >
                                                        <RefreshCw size={18} />
                                                    </button>
                                                )}
                                                <ChevronRight className="row-arrow" size={18} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubmissionsListPage;
