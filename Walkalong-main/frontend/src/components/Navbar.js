import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, CheckSquare, Layers, ListTodo, Calendar, Heart, Compass, Zap, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Mock logout
    navigate('/login');
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <Compass size={28} className="brand-icon" />
        <span className="brand-name">WalkAlong</span>
      </div>

      <div className="sidebar-menu">
        <Link to="/dashboard" className={`sidebar-item ${location.pathname === '/dashboard' || location.pathname === '/' ? 'active' : ''}`}>
          <Home size={20} />
          <span>Dashboard</span>
        </Link>

        <Link to="/streams" className={`sidebar-item ${location.pathname === '/streams' ? 'active' : ''}`}>
          <Layers size={20} />
          <span>Streams</span>
        </Link>

        <Link to="/tasks" className={`sidebar-item ${location.pathname === '/tasks' ? 'active' : ''}`}>
          <ListTodo size={20} />
          <span>Tasks</span>
        </Link>

        <Link to="/viewplan" className={`sidebar-item ${location.pathname === '/viewplan' ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>View Plan</span>
        </Link>

        <Link to="/motivation" className={`sidebar-item ${location.pathname === '/motivation' ? 'active' : ''}`}>
          <Zap size={20} />
          <span>Motivation</span>
        </Link>

        <Link to="/mood" className={`sidebar-item ${location.pathname === '/mood' ? 'active' : ''}`}>
          <Heart size={20} />
          <span>Mood</span>
        </Link>

        <Link to="/workdone" className={`sidebar-item ${location.pathname === '/workdone' ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>WorkDone</span>
        </Link>

        <Link to="/todo" className={`sidebar-item ${location.pathname === '/todo' ? 'active' : ''}`}>
          <CheckSquare size={20} />
          <span>Legacy Todo</span>
        </Link>
      </div>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;