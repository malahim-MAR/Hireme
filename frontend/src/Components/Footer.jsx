import React from 'react';
import { Layers, Heart, Shield, Terminal } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="tb-footer">
      <div className="tb-footer-container">
        <div className="tb-footer-brand">
          <div className="tb-footer-logo">
            <Layers size={18} />
          </div>
          <span className="tb-footer-title">
            Think<span className="text-blue-600">Board</span>
          </span>
          <span className="tb-footer-tag">Pipeline Tracker</span>
        </div>

        <div className="tb-footer-links">
          <span className="tb-footer-hint">
            Status-driven career pipeline management
          </span>
        </div>

        <div className="tb-footer-copy">
          © {currentYear} ThinkBoard. Built for focused job hunting.
        </div>
      </div>
    </footer>
  );
};

export default Footer;