import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, CheckSquare, Layers, ListTodo, Calendar, Heart, Compass, Zap, LogOut, Menu, X, Edit3, ClipboardList } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ logout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    document.body.classList.toggle('sidebar-collapsed');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isCollapsed ? <Menu size={24} /> : <X size={24} />}
      </button>
      <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
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

          <Link to="/answer-writing" className={`sidebar-item ${location.pathname === '/answer-writing' ? 'active' : ''}`}>
            <Edit3 size={20} />
            <span>Answer Writing</span>
          </Link>

          <Link to="/my-submissions" className={`sidebar-item ${location.pathname === '/my-submissions' ? 'active' : ''}`}>
            <ClipboardList size={20} />
            <span>My Submissions</span>
          </Link>

          <Link to="/todo" className={`sidebar-item ${location.pathname === '/todo' ? 'active' : ''}`}>
            <CheckSquare size={20} />
            <span>Legacy Todo</span>
          </Link>
        </div>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;