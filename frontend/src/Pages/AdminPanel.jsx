import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, RefreshCw, XCircle } from "lucide-react";

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

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:5001/api/auth/admin/pending");
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Unable to load pending accounts.");
      setAccounts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const reviewAccount = async (role, id, verificationStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/api/auth/admin/${role}/${id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationStatus,
          adminNotes: notes[id] || "",
        }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Unable to update review.");
      await fetchAccounts();
    } catch (err) {
      setError(err.message);
    }
  };

  const renderAccount = (account, role) => (
    <article className="admin-account-card" key={account.id}>
      <div>
        <span className="phase-pill">{statusLabels[account.verificationStatus]}</span>
        <h3>{role === "company" ? account.companyName : account.name}</h3>
        <p>{role === "company" ? account.workEmail : account.email}</p>
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
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}
        {loading ? (
          <section className="panel"><p>Loading pending accounts...</p></section>
        ) : (
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
        )}
      </div>
    </main>
  );
};

export default AdminPanel;
