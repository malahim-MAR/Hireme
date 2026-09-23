import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Hourglass, ShieldCheck, XCircle } from "lucide-react";
import { authRequest, getAuth, saveAuth } from "../api";

const WaitingReview = () => {
  const { state } = useLocation();
  const [account, setAccount] = useState(state?.account || getAuth());
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isCompany = account?.type === "company" || account?.role === "company";

  useEffect(() => {
    authRequest("/auth/me")
      .then(({ account: currentAccount }) => {
        saveAuth(currentAccount, currentAccount.role);
        setAccount(currentAccount);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    if (!account) return;
    setFormData(isCompany ? {
      phoneNumber: account.phoneNumber || "",
      location: account.location || "",
      industry: account.industry || "",
      website: account.website || "",
      description: account.description || "",
    } : {
      currentCompany: account.currentCompany || "",
      yearsOfExperience: account.yearsOfExperience || 0,
      linkedinProfile: account.linkedinProfile || "",
      phoneNumber: account.phoneNumber || "",
      location: account.location || "",
      portfolio: account.portfolio || "",
      primarySkills: account.primarySkills || "",
    });
  }, [account, isCompany]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleResubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const payload = {
        ...formData,
        yearsOfExperience: formData.yearsOfExperience === undefined ? undefined : Number(formData.yearsOfExperience),
      };
      const data = await authRequest("/auth/resubmit", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      saveAuth(data.account, data.account.role);
      setAccount(data.account);
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  const adminNote = account?.adminNote || account?.adminNotes || "";

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-wide">
        <div className={`auth-icon ${account?.verificationStatus === "rejected" ? "danger" : ""}`}>
          {account?.verificationStatus === "rejected" ? <XCircle size={28} /> : <Hourglass size={28} />}
        </div>
        <span className="eyebrow">{isCompany ? "Company verification" : "Developer verification"}</span>
        <h1>{account?.verificationStatus === "rejected" ? "Review was rejected" : "Admin will confirm your identity verification"}</h1>
        {account?.verificationStatus === "admin_pending" && (
          <p>Your profile is under review in the admin panel. Once verified, your workspace will open automatically.</p>
        )}
        {account?.verificationStatus === "needs_info" && (
          <p>Admin needs a little more information. Update the details below and resubmit for review.</p>
        )}
        {account?.verificationStatus === "rejected" && (
          <p>Your account was rejected by admin. This status does not allow resubmission.</p>
        )}
        {error && <div className="error-banner">{error}</div>}
        {message && <div className="success-banner">{message}</div>}
        <div className="review-note">
          <strong><ShieldCheck size={16} /> Current status</strong>
          <p>{account?.verificationStatus || "admin_pending"}</p>
        </div>
        {adminNote && (
          <div className="review-note">
            <strong>{account?.verificationStatus === "rejected" ? "Rejection reason" : "Admin note"}</strong>
            <p>{adminNote}</p>
          </div>
        )}
        {account?.verificationStatus === "needs_info" && (
          <form className="auth-form" onSubmit={handleResubmit}>
            {Object.entries(formData).map(([field, value]) => (
              <label key={field} className={field === "description" ? "auth-span-2" : undefined}>
                <span>{field.replace(/([A-Z])/g, " $1")}</span>
                {field === "description" ? (
                  <textarea name={field} value={value} onChange={handleChange} rows={3} />
                ) : (
                  <input
                    type={field === "yearsOfExperience" ? "number" : "text"}
                    name={field}
                    value={value}
                    onChange={handleChange}
                  />
                )}
              </label>
            ))}
            <button type="submit" className="btn-primary-action auth-submit">Resubmit for review</button>
          </form>
        )}
        <div className="waiting-actions">
          <Link to={isCompany ? "/company-login" : "/login"} className="btn-secondary-action">
            Back to login
          </Link>
          <Link to="/admin" className="text-button">Admin review panel</Link>
        </div>
      </section>
    </main>
  );
};

export default WaitingReview;
