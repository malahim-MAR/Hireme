import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MailCheck } from "lucide-react";

const EmailVerificationNotice = () => {
  const { state } = useLocation();
  const verificationUrl = state?.verificationUrl;
  const email = state?.email;

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-wide">
        <div className="auth-icon"><MailCheck size={28} /></div>
        <h1>Verify your email</h1>
        <p>
          We created your account. Please verify {email ? email : "your email"} before your
          details can move to admin review.
        </p>
        {verificationUrl ? (
          <a className="btn-primary-action auth-full-button" href={verificationUrl}>
            Open verification link
          </a>
        ) : (
          <p className="helper-text">Use the verification link from your email.</p>
        )}
        <Link to="/" className="text-button">Back to home</Link>
      </section>
    </main>
  );
};

export default EmailVerificationNotice;
