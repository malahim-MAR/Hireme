import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";
import { adminRequest, clearAdminAuth, getAdminToken, saveAdminToken } from "../api";

const statusLabels = {
  admin_pending: "Waiting review",
  needs_info: "Needs info",
  verified: "Verified",
  rejected: "Rejected",
};

const AdminPanel = () => {
  const [accounts, setAccounts] = useState({ companies: [], developers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState({});
  const [summary, setSummary] = useState({ hiresThisMonth: 0, hires: [] });
  const [password, setPassword] = useState("");
  const [isAdminAuthed, setIsAdminAuthed] = useState(Boolean(getAdminToken()));

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const [accountData, summaryData] = await Promise.all([
        adminRequest("/auth/admin/pending"),
        adminRequest("/auth/admin/summary"),
      ]);
      setAccounts(accountData);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
      if (err.message.includes("Admin authentication")) {
        clearAdminAuth();
        setIsAdminAuthed(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthed) fetchAccounts();
  }, [isAdminAuthed]);

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const data = await adminRequest("/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      saveAdminToken(data.token);
      setIsAdminAuthed(true);
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  const reviewAccount = async (role, id, verificationStatus) => {
    try {
      await adminRequest(`/auth/admin/${role}/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          verificationStatus,
          adminNotes: notes[id] || "",
        }),
      });
      await fetchAccounts();
    } catch (err) {
      setError(err.message);
    }
  };

  const renderAccount = (account, role) => {
    const detailItems = role === "company"
      ? [
        ["Phone", account.phoneNumber],
        ["Location", account.location],
        ["Industry", account.industry],
        ["Team size", account.employeeCount],
        ["Website", account.website],
        ["About", account.description],
      ]
      : [
        ["Phone", account.phoneNumber],
        ["Location", account.location],
        ["Current company", account.currentCompany],
        ["Experience", `${account.yearsOfExperience ?? 0} years`],
        ["LinkedIn", account.linkedinProfile],
        ["Portfolio", account.portfolio],
        ["Skills", account.primarySkills],
      ];

    return (
      <article className="admin-account-card" key={account.id}>
        <div>
          <span className="phase-label">{statusLabels[account.verificationStatus]}</span>
          <h3>{role === "company" ? account.companyName : account.name}</h3>
          <p>{role === "company" ? account.workEmail : account.email}</p>
        </div>
        <div className="admin-detail-grid">
          {detailItems.filter(([, value]) => value).map(([label, value]) => (
            <p key={label}><strong>{label}</strong><span>{value}</span></p>
          ))}
        </div>
        <textarea
          value={notes[account.id] || account.adminNotes || ""}
          onChange={(event) => setNotes({ ...notes, [account.id]: event.target.value })}
          placeholder="Notes for missing details or verification email"
          rows={3}
        />
        <div className="admin-actions">
          <button type="button" className="btn-primary-action" onClick={() => reviewAccount(role, account.id, "verified")}>
            <CheckCircle2 size={16} /> Verify
          </button>
          <button type="button" className="btn-secondary-action" onClick={() => reviewAccount(role, account.id, "needs_info")}>
            <Clock size={16} /> Needs info
          </button>
          <button type="button" className="danger-button" onClick={() => reviewAccount(role, account.id, "rejected")}>
            <XCircle size={16} /> Reject
          </button>
        </div>
      </article>
    );
  };

  if (!isAdminAuthed) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-header">
            <span className="eyebrow">Admin</span>
            <h1>Admin sign in</h1>
            <p>Use the separate admin password to review accounts and hiring activity.</p>
          </div>
          {error && <div className="error-banner">{error}</div>}
          <form className="auth-form" onSubmit={handleAdminLogin}>
            <label>
              <span>Password</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            <button type="submit" className="btn-primary-action auth-submit">Open admin</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="workflow-page">
      <div className="workflow-shell">
        <header className="workflow-header">
          <div>
            <span className="eyebrow">Admin</span>
            <h1>Identity verification</h1>
            <p>Review email-verified companies and developers before they can access the hiring app.</p>
          </div>
          <div className="workflow-actions">
            <button type="button" className="btn-secondary-action" onClick={fetchAccounts}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button type="button" className="danger-button" onClick={() => { clearAdminAuth(); setIsAdminAuthed(false); }}>
              Sign out
            </button>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}
        {loading ? (
          <section className="panel"><p>Loading pending accounts...</p></section>
        ) : (
          <>
            <section className="metric-grid" aria-label="Admin hiring metrics">
              <article className="metric-card">
                <CheckCircle2 size={20} />
                <span>Hires this month</span>
                <strong>{summary.hiresThisMonth}</strong>
              </article>
              <article className="metric-card">
                <Clock size={20} />
                <span>Pending companies</span>
                <strong>{accounts.companies.filter((account) => account.verificationStatus === "admin_pending").length}</strong>
              </article>
              <article className="metric-card">
                <Clock size={20} />
                <span>Pending developers</span>
                <strong>{accounts.developers.filter((account) => account.verificationStatus === "admin_pending").length}</strong>
              </article>
            </section>

            <div className="dashboard-two-col">
              <section className="panel">
              <div className="panel-header">
                <h2>Companies</h2>
                <span>{accounts.companies.length} pending</span>
              </div>
              <div className="admin-list">
                {accounts.companies.length > 0
                  ? accounts.companies.map((account) => renderAccount(account, "company"))
                  : <p className="empty-note">No pending company accounts.</p>}
              </div>
              </section>

              <section className="panel">
              <div className="panel-header">
                <h2>Developers</h2>
                <span>{accounts.developers.length} pending</span>
              </div>
              <div className="admin-list">
                {accounts.developers.length > 0
                  ? accounts.developers.map((account) => renderAccount(account, "developer"))
                  : <p className="empty-note">No pending developer accounts.</p>}
              </div>
              </section>
            </div>

            <section className="panel">
              <div className="panel-header">
                <h2>Hire history</h2>
                <span>{summary.hires.length} records</span>
              </div>
              <div className="pipeline-table">
                <div className="table-row table-head">
                  <span>Company</span>
                  <span>Developer</span>
                  <span>Hired at</span>
                </div>
                {summary.hires.map((hire) => (
                  <div className="table-row" key={hire.id}>
                    <span>{hire.companyName}</span>
                    <span>{hire.developerName}</span>
                    <span>{new Date(hire.hiredAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
};

export default AdminPanel;
