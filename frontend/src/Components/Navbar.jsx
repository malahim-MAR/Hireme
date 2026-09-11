import React from 'react';
import { Building2, BriefcaseBusiness, LayoutGrid, MessageSquare, PlusCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getAuth } from '../api';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const account = getAuth();
  const isDeveloper = account?.role === 'developer';
  const isCompany = account?.role === 'company';

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
          <Link to="/" className={`tb-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutGrid size={16} />
            <span>Pipeline Board</span>
          </Link>
          {isCompany && (
            <Link
              to="/hire"
              className={`tb-nav-item ${location.pathname.startsWith('/hire') || location.pathname.startsWith('/company') ? 'active' : ''}`}
            >
              <Building2 size={16} />
              <span>Company Hub</span>
            </Link>
          )}
          {isDeveloper && (
            <Link
              to="/dev-dashboard"
              className={`tb-nav-item ${location.pathname.startsWith('/dev') ? 'active' : ''}`}
            >
              <BriefcaseBusiness size={16} />
              <span>Developer Hub</span>
            </Link>
          )}
        </nav>

        {/* Actions / Primary CTA */}
        <div className="tb-navbar-actions">
          {account && (
            <Link to={isCompany ? "/company-chat" : "/dev-chat"} className="tb-nav-item tb-message-link">
              <MessageSquare size={16} />
              <span>Chats</span>
            </Link>
          )}
          {!account && (
            <Link to="/create" className="tb-create-btn" id="nav-create-application-btn">
              <PlusCircle size={17} className="tb-create-btn-icon" />
              <span className="tb-create-btn-text">Log Application</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
