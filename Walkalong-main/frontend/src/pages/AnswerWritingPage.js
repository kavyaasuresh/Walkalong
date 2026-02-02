import React, { useState, useEffect, useRef } from 'react';
import { Plus, Clock, Play, Pause, FileUp, Send, CheckCircle, AlertCircle, Bookmark } from 'lucide-react';
import { answersAPI } from '../services/api';
import './AnswerWritingPage.css';

const AnswerWritingPage = () => {
    const [questions, setQuestions] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ questionText: '', subject: '', topic: '' });

    const [timerActive, setTimerActive] = useState(false);
    const [timeTaken, setTimeTaken] = useState(0); // in seconds
    const timerRef = useRef(null);

    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [parentSubmissionId, setParentSubmissionId] = useState(null);

    useEffect(() => {
        fetchQuestions();

        // Check for retry param
        const params = new URLSearchParams(window.location.search);
        const retryId = params.get('retry');
        if (retryId) {
            setParentSubmissionId(retryId);
            fetchParentSubmission(retryId);
        }

        return () => clearInterval(timerRef.current);
    }, []);

    const fetchParentSubmission = async (id) => {
        try {
            const res = await answersAPI.getSubmission(id);
            setSelectedQuestion(res.data.question);
        } catch (error) {
            console.error('Error fetching parent submission:', error);
        }
    };

    const fetchQuestions = async () => {
        try {
            const res = await answersAPI.getQuestions();
            setQuestions(res.data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    const createQuestion = async (e) => {
        e.preventDefault();
        try {
            const res = await answersAPI.createQuestion(newQuestion);
            setQuestions([res.data, ...questions]);
            setNewQuestion({ questionText: '', subject: '', topic: '' });
            setShowQuestionForm(false);
            setSelectedQuestion(res.data);
        } catch (error) {
            console.error('Error creating question:', error);
        }
    };

    const toggleTimer = () => {
        if (timerActive) {
            clearInterval(timerRef.current);
            setTimerActive(false);
        } else {
            setTimerActive(true);
            timerRef.current = setInterval(() => {
                setTimeTaken(prev => prev + 1);
            }, 1000);
        }
    };

    const resetTimer = () => {
        clearInterval(timerRef.current);
        setTimerActive(false);
        setTimeTaken(0);
    };

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setMessage({ type: '', text: '' });
        } else {
            setFile(null);
            setMessage({ type: 'error', text: 'Please upload a PDF file.' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedQuestion) {
            setMessage({ type: 'error', text: 'Please select a question.' });
            return;
        }
        if (!file) {
            setMessage({ type: 'error', text: 'Please upload your answer PDF.' });
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('questionId', selectedQuestion.id);
        formData.append('timeTaken', Math.floor(timeTaken / 60)); // Send minutes
        if (parentSubmissionId) formData.append('parentSubmissionId', parentSubmissionId);
        formData.append('file', file);

        try {
            await answersAPI.submitAnswer(formData);
            setMessage({ type: 'success', text: 'Answer submitted successfully! Redirecting to submissions...' });
            setTimeout(() => {
                // Replace with window.location or useNavigate if within router
                window.location.href = '/my-submissions';
            }, 2000);
        } catch (error) {
            console.error('Error submitting answer:', error);
            setMessage({ type: 'error', text: 'Failed to submit answer. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="answer-writing-container">
            <div className="page-header">
                <h1>Answer Writing</h1>
                <p>Practice makes perfect. Simulate exam conditions and track your progress.</p>
            </div>

            <div className="writing-grid">
                <div className="writing-main glass-panel">
                    <div className="section-header">
                        <Bookmark className="header-icon" />
                        <h2>{selectedQuestion ? 'Step 1: Write Your Answer' : 'Step 1: Select a Question'}</h2>
                    </div>

                    {selectedQuestion ? (
                        <div className="selected-question-display">
                            <div className="question-meta">
                                <span className="badge subject">{selectedQuestion.subject}</span>
                                <span className="badge topic">{selectedQuestion.topic}</span>
                            </div>
                            <h3>{selectedQuestion.questionText}</h3>
                            <button className="text-btn" onClick={() => setSelectedQuestion(null)}>Change Question</button>
                        </div>
                    ) : (
                        <div className="question-selector">
                            <div className="questions-list">
                                {questions.map(q => (
                                    <div key={q.id} className="question-item" onClick={() => setSelectedQuestion(q)}>
                                        <div className="q-item-content">
                                            <span className="q-subject">{q.subject}</span>
                                            <p className="q-text">{q.questionText}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {!showQuestionForm ? (
                                <button className="add-question-btn" onClick={() => setShowQuestionForm(true)}>
                                    <Plus size={20} /> Add New Question
                                </button>
                            ) : (
                                <form className="new-question-form" onSubmit={createQuestion}>
                                    <textarea
                                        placeholder="Enter question text..."
                                        value={newQuestion.questionText}
                                        onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                                        required
                                    />
                                    <div className="form-row">
                                        <input
                                            type="text"
                                            placeholder="Subject (e.g. GS1)"
                                            value={newQuestion.subject}
                                            onChange={e => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Topic (e.g. History)"
                                            value={newQuestion.topic}
                                            onChange={e => setNewQuestion({ ...newQuestion, topic: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="secondary-btn" onClick={() => setShowQuestionForm(false)}>Cancel</button>
                                        <button type="submit" className="primary-btn">Save Question</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {selectedQuestion && (
                        <div className="submission-form-container">
                            <hr className="divider" />

                            <div className="timer-section">
                                <div className="timer-display">
                                    <Clock className="timer-icon" />
                                    <span className="time">{formatTime(timeTaken)}</span>
                                </div>
                                <div className="timer-controls">
                                    <button className={`timer-btn ${timerActive ? 'active' : ''}`} onClick={toggleTimer}>
                                        {timerActive ? <Pause size={18} /> : <Play size={18} />}
                                        {timerActive ? 'Stop Timer' : 'Start Timer'}
                                    </button>
                                    <button className="secondary-btn" onClick={resetTimer}>Reset</button>
                                </div>
                            </div>

                            <form className="submission-form" onSubmit={handleSubmit}>
                                <div className="file-upload-section">
                                    <label htmlFor="answer-pdf" className="file-label">
                                        <div className="upload-box">
                                            <FileUp size={32} />
                                            <p>{file ? file.name : 'Click to upload Answer (PDF only)'}</p>
                                        </div>
                                        <input
                                            type="file"
                                            id="answer-pdf"
                                            accept="application/pdf"
                                            onChange={handleFileChange}
                                            hidden
                                        />
                                    </label>
                                </div>

                                {message.text && (
                                    <div className={`message-banner ${message.type}`}>
                                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                        {message.text}
                                    </div>
                                )}

                                <button type="submit" className="submit-btn" disabled={isSubmitting || !file}>
                                    <Send size={18} /> {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                <div className="writing-sidebar">
                    <div className="sidebar-card glass-panel">
                        <h3>Submission Rules</h3>
                        <ul className="rules-list">
                            <li>PDF format only for security.</li>
                            <li>Once submitted, answer is locked.</li>
                            <li>Time tracking is encouraged.</li>
                            <li>Honest self-review leads to growth.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnswerWritingPage;
