import React, { useState } from 'react';
import { Edit3, HelpCircle, BookOpen, Hash, CheckCircle, AlertCircle } from 'lucide-react';
import { answersAPI } from '../services/api';
import './AnswerWritingPage.css';

const AnswerWritingPage = () => {
    const [question, setQuestion] = useState({
        text: '',
        subject: '',
        topic: '',
        source: 'Self'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                text: question.text,
                subject: question.subject,
                topic: question.topic,
                source: question.source
            };
            await answersAPI.createQuestion(payload);
            setMessage({ type: 'success', text: 'Question added to Question Bar!' });
            setQuestion({ text: '', subject: '', topic: '', source: 'Self' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to create question.' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="hub-container">
            <header className="hub-header">
                <div className="header-title">
                    <Edit3 className="header-icon" />
                    <h1>Create Question</h1>
                </div>
                <p>Build your question bank. These will appear in the Question Bar for attempts.</p>
            </header>

            <div className="glass-panel creation-form-container">
                <form onSubmit={handleSubmit} className="creation-form">
                    <div className="form-section">
                        <label><HelpCircle size={18} /> Question Text</label>
                        <textarea
                            placeholder="Type your question here..."
                            value={question.text}
                            onChange={e => setQuestion({ ...question, text: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-section">
                            <label><BookOpen size={18} /> Subject</label>
                            <input
                                type="text"
                                placeholder="e.g. History, Polity"
                                value={question.subject}
                                onChange={e => setQuestion({ ...question, subject: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-section">
                            <label><Hash size={18} /> Topic</label>
                            <input
                                type="text"
                                placeholder="e.g. Mughals, Fundamental Rights"
                                value={question.topic}
                                onChange={e => setQuestion({ ...question, topic: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <label>Source / Type</label>
                        <select
                            value={question.source}
                            onChange={e => setQuestion({ ...question, source: e.target.value })}
                        >
                            <option value="Self">Self Created</option>
                            <option value="GS">GS Mains</option>
                            <option value="Optional">Optional</option>
                            <option value="TestSeries">Test Series</option>
                        </select>
                    </div>

                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Add to Question Bar'}
                    </button>

                    {message && (
                        <div className={`form-message ${message.type}`}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AnswerWritingPage;
