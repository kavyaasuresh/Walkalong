import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, CheckSquare, Layers, ListTodo, Calendar, Heart, Compass, Sun, Moon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Compass size={24} className="text-accent-primary" />
          <span>WalkAlong</span>
        </Link>

        <div className="navbar-menu">
          <Link
            to="/dashboard"
            to="/workdone"
            className={`navbar-item ${location.pathname === '/workdone' ? 'active' : ''}`}
          >
            <BookOpen size={18} />
            <span>WorkDone</span>
          </Link>

          <Link
            to="/todo"
            className={`navbar-item ${location.pathname === '/todo' ? 'active' : ''}`}
          >
            <CheckSquare size={18} />
            <span>Todo</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;