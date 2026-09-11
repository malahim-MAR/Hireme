import React from 'react';
import { PlusCircle, Layers, Kanban, BriefcaseBusiness, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <header className="tb-navbar">
      <div className="tb-navbar-container">
        {/* Brand / Logo Mark */}
        <Link to="/" className="tb-brand" aria-label="ThinkBoard Home">
          <div className="tb-logo-icon">
            <span className="tb-logo-dot tb-dot-1"></span>
            <span className="tb-logo-dot tb-dot-2"></span>
            <span className="tb-logo-dot tb-dot-3"></span>
          </div>
          <div className="tb-brand-text">
            <span className="tb-brand-title">
              Think<span className="tb-brand-accent">Board</span>
            </span>
            <span className="tb-brand-tag">Pipeline</span>
          </div>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="tb-nav-links" aria-label="Main Navigation">
          <Link
            to="/"
            className={`tb-nav-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Layers size={16} />
            <span>Pipeline Board</span>
          </Link>
          <Link
            to="/dev-dashboard"
            className={`tb-nav-item ${location.pathname.startsWith('/dev') ? 'active' : ''}`}
          >
            <BriefcaseBusiness size={16} />
            <span>Developer Hub</span>
          </Link>
        </nav>

        {/* Actions / Primary CTA */}
        <div className="tb-navbar-actions">
          <Link to="/create" className="tb-create-btn" id="nav-create-application-btn">
            <PlusCircle size={17} className="tb-create-btn-icon" />
            <span className="tb-create-btn-text">Log Application</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;