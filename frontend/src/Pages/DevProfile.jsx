import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const DevProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "Sarthak Thakur",
    title: "Full Stack Developer",
    bio: "Passionate developer specializing in MERN stack and modern UI/UX design. 2+ years of experience building scalable web applications. Always looking for opportunities to build impactful products.",
    experience: "2 years",
    level: "Junior",
    country: "India",
    city: "Kolkata",
    email: "sarthak@example.com",
    github: "https://github.com/sarthak",
    linkedin: "https://linkedin.com/in/sarthak",
    portfolio: "https://sarthak.dev",
    skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript", "CSS", "Git"],
    education: "B.Tech Computer Science — XYZ University, 2024",
    availability: "Immediately",
  });

  const [newSkill, setNewSkill] = useState("");

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    alert("Profile saved successfully! (Hardcoded)");
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your profile? This cannot be undone.")) {
      alert("Profile deleted. (Hardcoded)");
      navigate("/login");
    }
  };

  return (
    <div className="devprofile-container">
      <div className="container">
        {/* Top Nav Bar */}
        <div className="devprofile-topbar">
          <Link to="/dev-dashboard" className="topbar-link">📊 Dashboard</Link>
          <Link to="/dev-chat" className="topbar-link">💬 Messages</Link>
        </div>

        <div className="devprofile-grid">
          {/* Left: Profile Header Card */}
          <div className="devprofile-header-card card">
            <div className="devprofile-banner"></div>
            <div className="devprofile-identity">
              <img
                src="https://via.placeholder.com/120"
                alt={profile.fullName}
                className="devprofile-avatar"
              />
              {isEditing ? (
                <>
                  <input
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    className="devprofile-edit-input"
                    placeholder="Full Name"
                  />
                  <input
                    name="title"
                    value={profile.title}
                    onChange={handleChange}
                    className="devprofile-edit-input devprofile-edit-sub"
                    placeholder="Job Title"
                  />
                </>
              ) : (
                <>
                  <h1 className="devprofile-name">{profile.fullName}</h1>
                  <p className="devprofile-title">{profile.title}</p>
                </>
              )}
              <p className="devprofile-location">
                📍 {profile.city}, {profile.country}
              </p>
              <div className="devprofile-meta">
                <span className="devprofile-badge">{profile.level}</span>
                <span className="devprofile-badge">{profile.experience} exp</span>
                <span className="devprofile-badge devprofile-badge-green">
                  {profile.availability}
                </span>
              </div>
            </div>

            <div className="devprofile-actions">
              {isEditing ? (
                <>
                  <button className="btn-primary" onClick={handleSave}>💾 Save Profile</button>
                  <button className="btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="btn-primary" onClick={() => setIsEditing(true)}>✏️ Edit Profile</button>
                  <button className="btn-danger" onClick={handleDelete}>🗑 Delete Profile</button>
                </>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="devprofile-details">
            {/* About */}
            <section className="devprofile-section card">
              <h3 className="devprofile-section-title">About</h3>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  rows={4}
                  className="devprofile-textarea"
                />
              ) : (
                <p className="devprofile-section-body">{profile.bio}</p>
              )}
            </section>

            {/* Skills */}
            <section className="devprofile-section card">
              <h3 className="devprofile-section-title">Skills</h3>
              <div className="devprofile-skills">
                {profile.skills.map((skill) => (
                  <span className="skill-tag" key={skill}>
                    {skill}
                    {isEditing && (
                      <button
                        className="skill-remove"
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="skill-add-row">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                  />
                  <button className="btn-outline btn-sm" onClick={handleAddSkill}>
                    Add
                  </button>
                </div>
              )}
            </section>

            {/* Experience & Education */}
            <section className="devprofile-section card">
              <h3 className="devprofile-section-title">Experience & Education</h3>
              <div className="devprofile-fieldgroup">
                <label>Experience Level</label>
                {isEditing ? (
                  <select name="level" value={profile.level} onChange={handleChange}>
                    <option>Junior</option>
                    <option>Mid</option>
                    <option>Senior</option>
                    <option>Lead</option>
                  </select>
                ) : (
                  <p>{profile.level} — {profile.experience}</p>
                )}
              </div>
              <div className="devprofile-fieldgroup">
                <label>Education</label>
                {isEditing ? (
                  <input name="education" value={profile.education} onChange={handleChange} />
                ) : (
                  <p>{profile.education}</p>
                )}
              </div>
            </section>

            {/* Contact & Links */}
            <section className="devprofile-section card">
              <h3 className="devprofile-section-title">Contact & Links</h3>
              {isEditing ? (
                <div className="devprofile-contact-edit">
                  <div className="devprofile-fieldgroup">
                    <label>Email</label>
                    <input name="email" value={profile.email} onChange={handleChange} />
                  </div>
                  <div className="devprofile-fieldgroup">
                    <label>GitHub</label>
                    <input name="github" value={profile.github} onChange={handleChange} />
                  </div>
                  <div className="devprofile-fieldgroup">
                    <label>LinkedIn</label>
                    <input name="linkedin" value={profile.linkedin} onChange={handleChange} />
                  </div>
                  <div className="devprofile-fieldgroup">
                    <label>Portfolio</label>
                    <input name="portfolio" value={profile.portfolio} onChange={handleChange} />
                  </div>
                  <div className="devprofile-fieldgroup">
                    <label>Country</label>
                    <input name="country" value={profile.country} onChange={handleChange} />
                  </div>
                  <div className="devprofile-fieldgroup">
                    <label>City</label>
                    <input name="city" value={profile.city} onChange={handleChange} />
                  </div>
                  <div className="devprofile-fieldgroup">
                    <label>Availability</label>
                    <select name="availability" value={profile.availability} onChange={handleChange}>
                      <option>Immediately</option>
                      <option>Within 2 weeks</option>
                      <option>Within 1 month</option>
                      <option>Not available</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="devprofile-contact-links">
                  <a href={`mailto:${profile.email}`}>📧 {profile.email}</a>
                  <a href={profile.github} target="_blank" rel="noreferrer">🐙 GitHub</a>
                  <a href={profile.linkedin} target="_blank" rel="noreferrer">🔗 LinkedIn</a>
                  <a href={profile.portfolio} target="_blank" rel="noreferrer">🌐 Portfolio</a>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevProfile;
