import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Hourglass, ShieldCheck } from "lucide-react";
import { getAuth } from "../api";

const WaitingReview = () => {
  const { state } = useLocation();
  const account = state?.account || getAuth();
  const isCompany = account?.type === "company" || account?.role === "company";

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-wide">
        <div className="auth-icon"><Hourglass size={28} /></div>
        <span className="eyebrow">{isCompany ? "Company verification" : "Developer verification"}</span>
        <h1>Admin will confirm your identity verification</h1>
        <p>
          Your profile is now in the admin panel under the {isCompany ? "company" : "developer"} category.
          Once admin verifies it, sign in again and your workspace will open automatically.
        </p>
        <div className="review-note">
          <strong><ShieldCheck size={16} /> Current status</strong>
          <p>{account?.verificationStatus === "needs_info" ? "Admin needs more information." : "Waiting for admin confirmation."}</p>
        </div>
        {account?.adminNotes && (
          <div className="review-note">
            <strong>Admin note</strong>
            <p>{account.adminNotes}</p>
          </div>
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
