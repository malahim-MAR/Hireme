import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Save } from "lucide-react";
import { apiRequest, getAuth } from "../api";

const CompanyProfile = () => {
  const account = getAuth();
  const [profile, setProfile] = useState({ about: "", totalHires: 0, openRoles: 0, preferredStacks: [], hiringHistory: [] });
  const [historyText, setHistoryText] = useState("");
  const [stackText, setStackText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!account?.id) return;
    apiRequest(`/companies/${account.id}/profile`)
      .then((data) => {
        const companyProfile = data.companyProfile || {};
        setProfile({
          about: companyProfile.about || data.about || "",
          totalHires: companyProfile.totalHires || 0,
          openRoles: companyProfile.openRoles || 0,
          preferredStacks: companyProfile.preferredStacks || [],
          hiringHistory: companyProfile.hiringHistory || [],
        });
      })
      .catch((requestError) => setError(requestError.message));
  }, [account?.id]);

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      const data = await apiRequest(`/companies/${account.id}/profile`, {
        method: "PATCH",
        body: JSON.stringify(profile),
      });
      setProfile(data.companyProfile);
      setMessage("Company profile saved to the database.");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const addValue = (field, value, clear) => {
    const item = value.trim();
    if (!item) return;
    setProfile({ ...profile, [field]: [...profile[field], item] });
    clear("");
  };

  return (
    <main className="workflow-page company-surface">
      <div className="workflow-shell">
        <header className="workflow-header">
          <div>
            <span className="section-label">Company profile</span>
            <h1>{account?.companyName || "Company profile"}</h1>
            <p>Keep your company story, hiring history, and current hiring needs up to date.</p>
          </div>
          <div className="workflow-actions">
            <Link to="/company-dashboard" className="btn-text">Dashboard</Link>
            <Link to="/company-chat" className="btn-primary company"><MessageSquare size={16} /> Chats</Link>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}
        {message && <div className="success-banner">{message}</div>}

        <form className="profile-doc" onSubmit={saveProfile}>
          <section className="doc-section">
            <h2 className="doc-section-title">About the company</h2>
            <textarea value={profile.about} onChange={(event) => setProfile({ ...profile, about: event.target.value })} rows={5} />
          </section>
          <section className="doc-section">
            <h2 className="doc-section-title">Hiring metrics</h2>
            <div className="profile-form-grid">
              <label><span>Total hires</span><input type="number" min="0" value={profile.totalHires} onChange={(event) => setProfile({ ...profile, totalHires: Number(event.target.value) })} /></label>
              <label><span>Open roles</span><input type="number" min="0" value={profile.openRoles} onChange={(event) => setProfile({ ...profile, openRoles: Number(event.target.value) })} /></label>
            </div>
          </section>
          <section className="doc-section">
            <h2 className="doc-section-title">Preferred stacks</h2>
            <div className="hire-card-skills">{profile.preferredStacks.map((stack) => <span className="skill-tag-outline" key={stack}>{stack}</span>)}</div>
            <div className="skill-add-row"><input value={stackText} onChange={(event) => setStackText(event.target.value)} placeholder="React, Node.js" /><button type="button" className="btn-text" onClick={() => addValue("preferredStacks", stackText, setStackText)}>Add</button></div>
          </section>
          <section className="doc-section">
            <h2 className="doc-section-title">Hiring history</h2>
            <div className="notification-list">{profile.hiringHistory.map((item) => <p className="notification-item" key={item}>{item}</p>)}</div>
            <div className="skill-add-row"><input value={historyText} onChange={(event) => setHistoryText(event.target.value)} placeholder="2025: hired 4 developers" /><button type="button" className="btn-text" onClick={() => addValue("hiringHistory", historyText, setHistoryText)}>Add</button></div>
          </section>
          <button type="submit" className="btn-primary company"><Save size={16} /> Save profile</button>
        </form>
      </div>
    </main>
  );
};

export default CompanyProfile;
