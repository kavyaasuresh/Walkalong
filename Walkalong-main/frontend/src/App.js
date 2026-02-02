import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import WorkDonePage from './pages/WorkDonePage';
import TodoPage from './pages/TodoPage';
import StreamsPage from './pages/StreamsPage';
import TasksPage from './pages/TasksPage';
import ViewPlanPage from './pages/ViewPlanPage';
import MoodPage from './pages/MoodPage';
import StreamDetail from './pages/StreamDetail';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MotivationPage from './pages/MotivationPage';
import AnswerWritingPage from './pages/AnswerWritingPage';
import SubmissionsListPage from './pages/SubmissionsListPage';
import AnswerReviewPage from './pages/AnswerReviewPage';
import QuestionBarPage from './pages/QuestionBarPage';
import ReviewQueuePage from './pages/ReviewQueuePage';
import './App.css';

const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const login = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };
  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar logout={logout} />}
        <main className={isAuthenticated ? "main-content" : "auth-content"}>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={login} />} />
            <Route path="/login" element={<LoginPage onLogin={login} />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard /></ProtectedRoute>} />
            <Route path="/workdone" element={<ProtectedRoute isAuthenticated={isAuthenticated}><WorkDonePage /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute isAuthenticated={isAuthenticated}><TasksPage /></ProtectedRoute>} />
            <Route path="/viewplan" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ViewPlanPage /></ProtectedRoute>} />
            <Route path="/streams" element={<ProtectedRoute isAuthenticated={isAuthenticated}><StreamsPage /></ProtectedRoute>} />
            <Route path="/streams/:id" element={<ProtectedRoute isAuthenticated={isAuthenticated}><StreamDetail /></ProtectedRoute>} />
            <Route path="/motivation" element={<ProtectedRoute isAuthenticated={isAuthenticated}><MotivationPage /></ProtectedRoute>} />
            <Route path="/mood" element={<ProtectedRoute isAuthenticated={isAuthenticated}><MoodPage /></ProtectedRoute>} />
            <Route path="/todo" element={<ProtectedRoute isAuthenticated={isAuthenticated}><TodoPage /></ProtectedRoute>} />
            <Route path="/answer-writing" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AnswerWritingPage /></ProtectedRoute>} />
            <Route path="/question-bar" element={<ProtectedRoute isAuthenticated={isAuthenticated}><QuestionBarPage /></ProtectedRoute>} />
            <Route path="/review-queue" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ReviewQueuePage /></ProtectedRoute>} />
            <Route path="/my-submissions" element={<ProtectedRoute isAuthenticated={isAuthenticated}><SubmissionsListPage /></ProtectedRoute>} />
            <Route path="/submission/:id" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AnswerReviewPage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;