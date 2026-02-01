import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, CheckSquare, Layers, ListTodo, Calendar, Heart } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          WalkAlong
        </Link>
        
        <div className="navbar-menu">
          <Link 
            to="/dashboard" 
            className={`navbar-item ${location.pathname === '/dashboard' || location.pathname === '/' ? 'active' : ''}`}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/streams" 
            className={`navbar-item ${location.pathname === '/streams' ? 'active' : ''}`}
          >
            <Layers size={20} />
            <span>Streams</span>
          </Link>
          
          <Link 
            to="/tasks" 
            className={`navbar-item ${location.pathname === '/tasks' ? 'active' : ''}`}
          >
            <ListTodo size={20} />
            <span>Tasks</span>
          </Link>
          
          <Link 
            to="/viewplan" 
            className={`navbar-item ${location.pathname === '/viewplan' ? 'active' : ''}`}
          >
            <Calendar size={20} />
            <span>View Plan</span>
          </Link>
          
          <Link 
            to="/mood" 
            className={`navbar-item ${location.pathname === '/mood' ? 'active' : ''}`}
          >
            <Heart size={20} />
            <span>Mood</span>
          </Link>
          
          <Link 
            to="/workdone" 
            className={`navbar-item ${location.pathname === '/workdone' ? 'active' : ''}`}
          >
            <BookOpen size={20} />
            <span>WorkDone</span>
          </Link>
          
          <Link 
            to="/todo" 
            className={`navbar-item ${location.pathname === '/todo' ? 'active' : ''}`}
          >
            <CheckSquare size={20} />
            <span>Todo</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;