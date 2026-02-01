import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import WorkDonePage from './pages/WorkDonePage';
import TodoPage from './pages/TodoPage';
import StreamsPage from './pages/StreamsPage';
import TasksPage from './pages/TasksPage';
import ViewPlanPage from './pages/ViewPlanPage';
import MoodPage from './pages/MoodPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workdone" element={<WorkDonePage />} />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="/streams" element={<StreamsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/viewplan" element={<ViewPlanPage />} />
            <Route path="/mood" element={<MoodPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;