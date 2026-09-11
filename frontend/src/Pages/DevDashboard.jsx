import React from "react";
import { Link } from "react-router-dom";

const DevDashboard = () => {
  // Hardcoded developer data for demonstration
  const devProfile = {
    name: "Sarthak Thakur",
    role: "Full Stack Developer",
    location: "Kolkata, India",
    views: 124,
    profileClicks: 32,
    about: "Passionate developer specializing in MERN stack and modern UI/UX design. Always looking for opportunities to build impactful products.",
    avatar: "https://via.placeholder.com/150"
  };

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-grid">
          {/* Left Sidebar: Profile Card */}
          <aside className="dashboard-profile-card card">
            <div className="profile-header-bg"></div>
            <div className="profile-info">
              <img src={devProfile.avatar} alt={devProfile.name} className="profile-avatar" />
              <h2 className="profile-name">{devProfile.name}</h2>
              <p className="profile-role">{devProfile.role}</p>
              <div className="profile-divider"></div>
              <p className="profile-location">{devProfile.location}</p>
              <button className="edit-profile-btn">Edit Profile</button>
            </div>
          </aside>

          {/* Main Content: Stats & Projects */}
          <main className="dashboard-main">
            {/* Stats Card */}
            <section className="stats-section card">
              <div className="section-header">
                <h3>Analytics Overview</h3>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Profile Views</span>
                  <span className="stat-value">{devProfile.views}</span>
                  <span className="stat-trend">+15% this week</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Profile Clicks</span>
                  <span className="stat-value">{devProfile.profileClicks}</span>
                  <span className="stat-trend">+5% this week</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Job Applications</span>
                  <span className="stat-value">8</span>
                  <span className="stat-trend">Active</span>
                </div>
              </div>
            </section>

            {/* Profile Intro Section */}
            <section className="about-section card">
              <div className="section-header">
                <h3>About You</h3>
              </div>
              <div className="section-body">
                <p>{devProfile.about}</p>
              </div>
            </section>

            {/* Quick Actions */}
            <div className="quick-actions">
              <Link to="/create" className="action-card card">
                <div className="action-icon">📝</div>
                <div className="action-text">
                  <h4>Create New Post</h4>
                  <p>Share your latest project update</p>
                </div>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DevDashboard;
