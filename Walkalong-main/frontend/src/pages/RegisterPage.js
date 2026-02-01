import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, ArrowRight } from 'lucide-react';
import './AuthPages.css';

const RegisterPage = () => {
    const [userData, setUserData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock registration
        console.log("Registering...", userData);
        navigate('/dashboard');
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass-panel">
                <div className="auth-header">
                    <div className="auth-icon-wrapper register">
                        <UserPlus size={32} />
                    </div>
                    <h1>Create Account</h1>
                    <p>Join Walkalong and start tracking your success</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-input-group">
                        <label>Full Name</label>
                        <div className="input-wrapper">
                            <User size={18} className="input-icon" />
                            <input
                                type="text"
                                placeholder="John Doe"
                                required
                                value={userData.name}
                                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={userData.email}
                                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
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
                                value={userData.password}
                                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button type="submit" className="auth-submit-btn">
                        Get Started <ArrowRight size={18} />
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>

            <div className="auth-background-decor">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>
        </div>
    );
};

export default RegisterPage;
