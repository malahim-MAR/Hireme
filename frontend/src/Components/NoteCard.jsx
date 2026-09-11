import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  SquarePen,
  Trash2,
  Mail,
  Phone,
  Building2,
  Calendar,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Filter,
  ArrowUpDown,
  Check,
  AlertCircle,
  Briefcase,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import RateLimiter from '../Components/RateLimiter';
import './NoteCard.css';

// Status Stage Configuration
export const STAGES = [
  { id: 'all', label: 'All Applications', key: null },
  { id: 'Applied', label: 'Applied', colorKey: 'applied' },
  { id: 'Interview', label: 'Interviewing', colorKey: 'interview' },
  { id: 'Offer', label: 'Offer Received', colorKey: 'offer' },
  { id: 'Rejected', label: 'Archived / Rejected', colorKey: 'rejected' },
];

const NoteCard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Filters and UI state
  const [activeStage, setActiveStage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'company'
  const [expandedCards, setExpandedCards] = useState({}); // { [id]: boolean }
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5001/api/notes');
      setNotes(Array.isArray(res.data) ? res.data : []);
      setIsRateLimited(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching notes:', err);
      if (err.response?.status === 429) {
        setIsRateLimited(true);
      } else {
        setIsRateLimited(false);
        setError('Unable to load application pipeline. Please verify the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Compute Stage Counts
  const stageCounts = useMemo(() => {
    const counts = {
      all: notes.length,
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };
    notes.forEach((note) => {
      const status = note.Status || 'Applied';
      if (counts[status] !== undefined) {
        counts[status] += 1;
      } else {
        counts.Applied += 1;
      }
    });
    return counts;
  }, [notes]);

  // Filtered & Sorted Notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const noteStatus = note.Status || 'Applied';
        if (activeStage !== 'all' && noteStatus !== activeStage) {
          return false;
        }
        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase();
        const fullName = `${note.First_Name || ''} ${note.Last_Name || ''}`.toLowerCase();
        const role = (note.Job_Title || '').toLowerCase();
        const company = (note.Company || '').toLowerCase();
        const email = (note.Email || '').toLowerCase();
        const coverLetter = (note.Cover_Letter || '').toLowerCase();

        return (
          fullName.includes(q) ||
          role.includes(q) ||
          company.includes(q) ||
          email.includes(q) ||
          coverLetter.includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'company') {
          return (a.Company || '').localeCompare(b.Company || '');
        }
        return 0;
      });
  }, [notes, activeStage, searchQuery, sortBy]);

  // Delete handler
  const handleDelete = async (e, id, applicantName) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm(`Delete application for "${applicantName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5001/api/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note._id !== id));
      toast.success('Application removed from pipeline');
    } catch (err) {
      console.error('Error deleting note:', err);
      toast.error('Failed to delete application');
    }
  };

  // Quick Status Updater
  const handleStatusChange = async (e, note, newStatus) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      setUpdatingStatusId(note._id);
      await axios.put(`http://localhost:5001/api/notes/${note._id}`, {
        ...note,
        Status: newStatus,
      });
      setNotes((prev) =>
        prev.map((item) => (item._id === note._id ? { ...item, Status: newStatus } : item))
      );
      toast.success(`Stage updated to "${newStatus}"`);
    } catch (err) {
      console.error('Error updating stage:', err);
      toast.error('Could not update stage status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getInitials = (firstName = '', lastName = '') => {
    const f = firstName.trim()[0] || '';
    const l = lastName.trim()[0] || '';
    return (f + l).toUpperCase() || 'AP';
  };

  const formatRelativeDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Recently';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isRateLimited) {
    return (
      <div className="h-[100vh] bg-slate-50 flex items-center justify-center">
        <RateLimiter />
      </div>
    );
  }

  return (
    <div className="pipeline-view-wrapper">
      {/* Pipeline Header */}
      <section className="pipeline-header-section">
        <div className="pipeline-header-top">
          <div>
            <div className="pipeline-badge">
              <span className="pulse-dot"></span>
              Active Job Pipeline
            </div>
            <h1 className="pipeline-headline">Application Tracker</h1>
            <p className="pipeline-subhead">
              Manage candidate roles, monitor hiring stages, and track correspondence across your job hunt.
            </p>
          </div>
          <Link to="/create" className="pipeline-primary-cta" id="pipeline-hero-cta">
            <Plus size={18} />
            <span>Log Application</span>
          </Link>
        </div>

        {/* Pipeline Stage Tabs */}
        <div className="stage-tabs-container">
          <button
            type="button"
            className={`stage-tab ${activeStage === 'all' ? 'active' : ''}`}
            onClick={() => setActiveStage('all')}
          >
            <span className="stage-tab-label">All Applications</span>
            <span className="stage-tab-count">{stageCounts.all}</span>
          </button>

          <button
            type="button"
            className={`stage-tab stage-tab-applied ${activeStage === 'Applied' ? 'active' : ''}`}
            onClick={() => setActiveStage('Applied')}
          >
            <span className="stage-dot dot-applied"></span>
            <span className="stage-tab-label">Applied</span>
            <span className="stage-tab-count">{stageCounts.Applied}</span>
          </button>

          <button
            type="button"
            className={`stage-tab stage-tab-interview ${activeStage === 'Interview' ? 'active' : ''}`}
            onClick={() => setActiveStage('Interview')}
          >
            <span className="stage-dot dot-interview"></span>
            <span className="stage-tab-label">Interviewing</span>
            <span className="stage-tab-count">{stageCounts.Interview}</span>
          </button>

          <button
            type="button"
            className={`stage-tab stage-tab-offer ${activeStage === 'Offer' ? 'active' : ''}`}
            onClick={() => setActiveStage('Offer')}
          >
            <span className="stage-dot dot-offer"></span>
            <span className="stage-tab-label">Offer Received</span>
            <span className="stage-tab-count">{stageCounts.Offer}</span>
          </button>

          <button
            type="button"
            className={`stage-tab stage-tab-rejected ${activeStage === 'Rejected' ? 'active' : ''}`}
            onClick={() => setActiveStage('Rejected')}
          >
            <span className="stage-dot dot-rejected"></span>
            <span className="stage-tab-label">Rejected</span>
            <span className="stage-tab-count">{stageCounts.Rejected}</span>
          </button>
        </div>

        {/* Search & Sort Controls Bar */}
        <div className="pipeline-controls-bar">
          <div className="search-input-wrapper">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              placeholder="Search by role, company, applicant name, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              aria-label="Search applications"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="sort-controls-wrapper">
            <div className="sort-select-container">
              <ArrowUpDown size={15} className="sort-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
                aria-label="Sort applications"
              >
                <option value="newest">Sort by: Newest Applied</option>
                <option value="oldest">Sort by: Oldest Applied</option>
                <option value="company">Sort by: Company (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Loading Skeleton */}
      {loading && (
        <div className="pipeline-loading-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-card">
              <div className="skeleton-line skeleton-header"></div>
              <div className="skeleton-line skeleton-meta"></div>
              <div className="skeleton-line skeleton-body"></div>
              <div className="skeleton-line skeleton-footer"></div>
            </div>
          ))}
        </div>
      )}

      {/* Server Error State */}
      {!loading && error && (
        <div className="pipeline-error-box">
          <AlertCircle size={28} className="error-icon" />
          <h3 className="error-title">Connection Issue</h3>
          <p className="error-desc">{error}</p>
          <button type="button" onClick={fetchNotes} className="retry-btn">
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty State: No applications at all */}
      {!loading && !error && notes.length === 0 && (
        <div className="pipeline-empty-state">
          <div className="empty-state-icon-wrap">
            <Briefcase size={36} className="empty-state-icon" />
          </div>
          <h2 className="empty-state-title">Your application pipeline is clear</h2>
          <p className="empty-state-text">
            You haven't logged any job applications yet. Track every role from initial submission through technical rounds, onsite interviews, and final offers.
          </p>
          <Link to="/create" className="empty-state-cta">
            <Plus size={18} />
            <span>Log Your First Application</span>
          </Link>
        </div>
      )}

      {/* Empty Filter State: Filter / Search returned 0 */}
      {!loading && !error && notes.length > 0 && filteredNotes.length === 0 && (
        <div className="pipeline-no-matches">
          <Filter size={32} className="no-matches-icon" />
          <h3 className="no-matches-title">No applications match your criteria</h3>
          <p className="no-matches-text">
            {searchQuery
              ? `No entries found matching "${searchQuery}" in stage "${activeStage}".`
              : `No applications currently in the "${activeStage}" stage.`}
          </p>
          <button
            type="button"
            className="reset-filter-btn"
            onClick={() => {
              setActiveStage('all');
              setSearchQuery('');
            }}
          >
            Reset Stage & Search Filters
          </button>
        </div>
      )}

      {/* Pipeline Cards Grid */}
      {!loading && !error && filteredNotes.length > 0 && (
        <div className="pipeline-grid">
          {filteredNotes.map((note) => {
            const status = note.Status || 'Applied';
            const isExpanded = !!expandedCards[note._id];
            const applicantFullName = `${note.First_Name || ''} ${note.Last_Name || ''}`.trim() || 'Applicant';
            const initials = getInitials(note.First_Name, note.Last_Name);

            return (
              <article key={note._id} className={`pipeline-card stage-border-${status.toLowerCase()}`}>
                {/* Top Section: Applicant Info & Stage Pill & Actions */}
                <div className="card-top-row">
                  <div className="applicant-info-block">
                    <div className={`applicant-avatar avatar-bg-${status.toLowerCase()}`}>
                      {initials}
                    </div>
                    <div>
                      <h2 className="applicant-name">{applicantFullName}</h2>
                      <p className="applicant-role">{note.Job_Title || 'Target Role'}</p>
                    </div>
                  </div>

                  <div className="card-actions-wrapper">
                    {/* Status Pill with Quick Stage Selector */}
                    <div className="status-selector-group">
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(e, note, e.target.value)}
                        disabled={updatingStatusId === note._id}
                        className={`status-pill-select stage-${status.toLowerCase()}`}
                        title="Click to update application stage"
                        aria-label={`Current status: ${status}. Click to change stage.`}
                      >
                        <option value="Applied">● Applied</option>
                        <option value="Interview">● Interviewing</option>
                        <option value="Offer">● Offer Received</option>
                        <option value="Rejected">● Rejected</option>
                      </select>
                    </div>

                    {/* Action buttons */}
                    <div className="card-btn-group">
                      <Link
                        to={`/notedetail/${note._id}`}
                        className="card-icon-btn edit-btn"
                        title="Edit Application Details"
                        aria-label="Edit Application"
                      >
                        <SquarePen size={15} />
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, note._id, applicantFullName)}
                        className="card-icon-btn delete-btn"
                        title="Delete Application"
                        aria-label="Delete Application"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Secondary Meta Row: Company & Contacts */}
                <div className="card-meta-row">
                  <div className="meta-pill company-pill">
                    <Building2 size={14} className="meta-icon" />
                    <span className="meta-bold">{note.Company || 'Direct Application'}</span>
                  </div>

                  {note.Email && (
                    <a
                      href={`mailto:${note.Email}`}
                      className="meta-pill contact-pill"
                      title={`Email: ${note.Email}`}
                    >
                      <Mail size={13} className="meta-icon" />
                      <span>{note.Email}</span>
                    </a>
                  )}

                  {note.Phone && (
                    <a
                      href={`tel:${note.Phone}`}
                      className="meta-pill contact-pill"
                      title={`Call: ${note.Phone}`}
                    >
                      <Phone size={13} className="meta-icon" />
                      <span>{note.Phone}</span>
                    </a>
                  )}
                </div>

                {/* Body: Cover Letter / Pitch Notes */}
                <div className="card-body-section">
                  <div className="cover-letter-label">
                    <span>Cover Letter Excerpt</span>
                  </div>
                  <p className={`cover-letter-text ${isExpanded ? 'expanded' : 'clamped'}`}>
                    {note.Cover_Letter || 'No cover letter excerpt provided for this role.'}
                  </p>

                  {note.Cover_Letter && note.Cover_Letter.length > 120 && (
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(e, note._id)}
                      className="read-more-toggle"
                    >
                      {isExpanded ? (
                        <>
                          <span>Show Less</span>
                          <ChevronUp size={14} />
                        </>
                      ) : (
                        <>
                          <span>Read Full Letter</span>
                          <ChevronDown size={14} />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Card Footer: Timestamp & Quick Detail Link */}
                <div className="card-footer-row">
                  <div className="applied-date-wrap">
                    <Calendar size={13} className="date-icon" />
                    <span>Applied on {formatRelativeDate(note.createdAt)}</span>
                  </div>

                  <Link to={`/notedetail/${note._id}`} className="view-details-link">
                    <span>Edit & Notes</span>
                    <SquarePen size={13} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NoteCard;
