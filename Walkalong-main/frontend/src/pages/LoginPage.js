import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, User, Lock, ArrowRight } from 'lucide-react';
import './AuthPages.css';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock login
        console.log("Logging in...", credentials);
        navigate('/dashboard');
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel">
                <div className="auth-header">
                    <div className="auth-icon-wrapper">
                        <LogIn size={32} />
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Enter your credentials to access your workspace</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={credentials.email}
                                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="auth-submit-btn">
                        Sign In <ArrowRight size={18} />
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Create one</Link></p>
                </div>
            </div>

            <div className="auth-background-decor">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>
        </div>
    );
};

export default LoginPage;
