import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

const HomePage = () => {
  return (
    <main className="start-page">
      <section className="start-hero">
        <div className="start-copy">
          <span className="section-label">HireMe access</span>
          <h1>Choose how you want to enter</h1>
          <p>
            Companies and developers use separate workspaces. Pick your role,
            create your profile, then admin verifies your identity before the dashboard opens.
          </p>
        </div>

        <div className="role-choice-grid" aria-label="Choose account type">
          <Link to="/company-login" className="role-choice-card company-card">
            <span className="section-label">I am hiring</span>
            <strong>Company</strong>
            <p>Post your company details, browse verified developers, and manage hiring chats.</p>
            <span className="role-action">Continue as company <ArrowRight size={15} /></span>
          </Link>

          <Link to="/login" className="role-choice-card developer-card">
            <span className="section-label">I want work</span>
            <strong>Developer</strong>
            <p>Create your profile, get reviewed by admin, and reply to company conversations.</p>
            <span className="role-action">Continue as developer <ArrowRight size={15} /></span>
          </Link>
        </div>

        <div className="start-review-strip">
          <ShieldCheck size={16} />
          <span>Signup leads to login, login leads to admin identity verification, verification unlocks the correct workspace.</span>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
