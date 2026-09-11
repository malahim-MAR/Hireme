import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Hourglass } from "lucide-react";

const WaitingReview = () => {
  const { state } = useLocation();
  const account = state?.account;

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-wide">
        <div className="auth-icon"><Hourglass size={28} /></div>
        <h1>Waiting for identity review</h1>
        <p>
          Your email is verified. Our admin team will review your identity and details.
          You will get an email when you are verified or if some detail is missing.
        </p>
        {account?.adminNotes && (
          <div className="review-note">
            <strong>Admin note</strong>
            <p>{account.adminNotes}</p>
          </div>
        )}
        <div className="waiting-actions">
          <Link to={account?.type === "company" ? "/company-login" : "/login"} className="btn-secondary-action">
            Back to login
          </Link>
          <Link to="/admin" className="text-button">Admin review panel</Link>
        </div>
      </section>
    </main>
  );
};

export default WaitingReview;
