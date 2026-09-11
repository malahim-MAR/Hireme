import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Save, Trash2 } from "lucide-react";
import { apiRequest, getAuth } from "../api";

const DevProfile = () => {
  const navigate = useNavigate();
  const account = getAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ fullName: "", title: "", bio: "", experience: "", level: "", country: "", city: "", email: "", github: "", linkedin: "", portfolio: "", skills: [], education: "", availability: "" });
  const [error, setError] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  React.useEffect(() => {
    if (!account?.id) return;
    apiRequest(`/developers/${account.id}/profile`)
      .then((data) => setProfile({
        ...data.profile,
        fullName: data.profile?.fullName || data.name,
        bio: data.profile?.about || "",
        email: data.email,
        skills: data.profile?.skills || [],
      }))
      .catch((requestError) => setError(requestError.message));
  }, [account?.id]);

  const handleChange = (event) => {
    setProfile({ ...profile, [event.target.name]: event.target.value });
  };

  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (skill && !profile.skills.includes(skill)) {
      setProfile({ ...profile, skills: [...profile.skills, skill] });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleSave = async () => {
    try {
      const data = await apiRequest(`/developers/${account.id}/profile`, {
        method: "PATCH",
        body: JSON.stringify({
          fullName: profile.fullName,
          title: profile.title,
          about: profile.bio,
          experience: profile.experience,
          level: profile.level,
          country: profile.country,
          city: profile.city,
          skills: profile.skills,
          availability: profile.availability,
          education: profile.education,
          github: profile.github,
          linkedin: profile.linkedin,
          portfolio: profile.portfolio,
        }),
      });
      setProfile({ ...profile, ...data.profile, bio: data.profile.about });
      setIsEditing(false);
      setSaveMessage("Profile saved to the database.");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your profile? This cannot be undone.")) {
      navigate("/login");
    }
  };

  return (
    <main className="workflow-page">
      <div className="workflow-shell">
        <header className="workflow-header">
          <div>
            <span className="eyebrow">Developer profile</span>
            <h1>{profile.fullName}</h1>
            <p>Keep your details current so companies know your stack, location, and availability.</p>
          </div>
          <div className="workflow-actions">
            <Link to="/dev-dashboard" className="btn-secondary-action">Dashboard</Link>
            <Link to="/dev-chat" className="btn-primary-action"><MessageSquare size={16} /> Chats</Link>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}
        {saveMessage && <div className="success-banner">{saveMessage}</div>}

        <div className="profile-layout">
          <aside className="profile-summary panel">
            <div className="profile-avatar-large">ST</div>
            {isEditing ? (
              <>
                <input name="fullName" value={profile.fullName} onChange={handleChange} />
                <input name="title" value={profile.title} onChange={handleChange} />
              </>
            ) : (
              <>
                <h2>{profile.fullName}</h2>
                <p>{profile.title}</p>
              </>
            )}
            <div className="profile-badges">
              <span className="phase-pill">{profile.level}</span>
              <span className="phase-pill">{profile.experience}</span>
              <span className="phase-pill">{profile.availability}</span>
            </div>
            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button className="btn-primary-action" type="button" onClick={handleSave}><Save size={16} /> Save</button>
                  <button className="btn-secondary-action" type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="btn-primary-action" type="button" onClick={() => setIsEditing(true)}>Edit profile</button>
                  <button className="danger-button" type="button" onClick={handleDelete}><Trash2 size={16} /> Delete</button>
                </>
              )}
            </div>
          </aside>

          <section className="profile-details">
            <article className="panel">
              <div className="panel-header"><h2>About</h2></div>
              {isEditing ? (
                <textarea name="bio" value={profile.bio} onChange={handleChange} rows={5} />
              ) : (
                <p>{profile.bio}</p>
              )}
            </article>

            <article className="panel">
              <div className="panel-header"><h2>Skills</h2></div>
              <div className="hire-card-skills">
                {profile.skills.map((skill) => (
                  <span className="skill-tag editable-skill" key={skill}>
                    {skill}
                    {isEditing && (
                      <button type="button" onClick={() => handleRemoveSkill(skill)} aria-label={`Remove ${skill}`}>
                        x
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="skill-add-row">
                  <input
                    value={newSkill}
                    onChange={(event) => setNewSkill(event.target.value)}
                    placeholder="Add a skill"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <button className="btn-secondary-action" type="button" onClick={handleAddSkill}>Add</button>
                </div>
              )}
            </article>

            <article className="panel form-grid-panel">
              <div className="panel-header"><h2>Details</h2></div>
              <div className="profile-form-grid">
                <label>
                  <span>Experience level</span>
                  {isEditing ? (
                    <select name="level" value={profile.level} onChange={handleChange}>
                      <option>Junior</option>
                      <option>Mid</option>
                      <option>Senior</option>
                      <option>Lead</option>
                    </select>
                  ) : <strong>{profile.level}</strong>}
                </label>
                <label>
                  <span>Experience</span>
                  {isEditing ? <input name="experience" value={profile.experience} onChange={handleChange} /> : <strong>{profile.experience}</strong>}
                </label>
                <label>
                  <span>City</span>
                  {isEditing ? <input name="city" value={profile.city} onChange={handleChange} /> : <strong>{profile.city}</strong>}
                </label>
                <label>
                  <span>Country</span>
                  {isEditing ? <input name="country" value={profile.country} onChange={handleChange} /> : <strong>{profile.country}</strong>}
                </label>
                <label>
                  <span>Availability</span>
                  {isEditing ? (
                    <select name="availability" value={profile.availability} onChange={handleChange}>
                      <option>Immediately</option>
                      <option>Within 2 weeks</option>
                      <option>Within 1 month</option>
                      <option>Not available</option>
                    </select>
                  ) : <strong>{profile.availability}</strong>}
                </label>
                <label>
                  <span>Education</span>
                  {isEditing ? <input name="education" value={profile.education} onChange={handleChange} /> : <strong>{profile.education}</strong>}
                </label>
              </div>
            </article>

            <article className="panel form-grid-panel">
              <div className="panel-header"><h2>Contact links</h2></div>
              <div className="profile-form-grid">
                {["email", "github", "linkedin", "portfolio"].map((field) => (
                  <label key={field}>
                    <span>{field}</span>
                    {isEditing ? (
                      <input name={field} value={profile[field]} onChange={handleChange} />
                    ) : (
                      <a href={field === "email" ? `mailto:${profile[field]}` : profile[field]} target={field === "email" ? undefined : "_blank"} rel="noreferrer">
                        {profile[field]}
                      </a>
                    )}
                  </label>
                ))}
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
};

export default DevProfile;
