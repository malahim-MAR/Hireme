import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, getAuth } from "../api";

const PIPELINE_STAGES = ["Intro", "Screening", "Interview", "Offer", "Hired"];

const phaseMatchesStage = (phase = "", stage = "") => {
  const normalizedPhase = phase.toLowerCase();
  const normalizedStage = stage.toLowerCase();
  if (normalizedStage === "interview") return normalizedPhase.includes("interview");
  return normalizedPhase === normalizedStage;
};

const PipelineTracker = ({ phases }) => {
  // Show which stages actually have candidates
  return (
    <div className="pipeline-tracker company" role="list">
      {PIPELINE_STAGES.map((stage, i) => {
        const hasCount = phases.some((p) => phaseMatchesStage(p.stage, stage) && p.count > 0);
        return (
          <div
            key={stage}
            className={`pipeline-step${hasCount ? " active" : ""}`}
            role="listitem"
          >
            <div className="pipeline-step-dot" />
            <span className="pipeline-step-label">{stage}</span>
          </div>
        );
      })}
    </div>
  );
};

const CompanyDashboard = () => {
  const account = getAuth();
  const [developers, setDevelopers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!account?.id) return;
    Promise.all([
      apiRequest("/developers"),
      apiRequest("/chats"),
    ]).then(([developerData, chatData]) => {
      setDevelopers(developerData);
      setConversations(chatData);
    }).catch((requestError) => setError(requestError.message));
  }, [account?.id]);

  const stats = useMemo(() => {
    const contacted = conversations;
    const replied = contacted.filter((conversation) => conversation.messages.at(-1)?.from === "dev");

    return {
      contacted: contacted.length,
      replied: replied.length,
      replyRate: Math.round((replied.length / Math.max(contacted.length, 1)) * 100),
      activeChats: conversations.length,
    };
  }, [conversations]);

  const pipelineStages = [...new Set(conversations.map((conversation) => conversation.phase).filter(Boolean))];
  const chatByDeveloper = new Map(conversations.map((conversation) => [String(conversation.developerId), conversation]));
  const stageCounts = pipelineStages.map((stage) => ({
    stage,
    count: developers.filter((dev) => chatByDeveloper.get(String(dev.id))?.phase === stage).length,
  }));

  return (
    <main className="workflow-page">
      <div className="workflow-shell">
        <header className="workflow-header">
          <div>
            <span className="section-label">Company dashboard</span>
            <h1>Hiring pipeline</h1>
            <p>Track contacted developers, replies, and where each candidate sits in the process.</p>
          </div>
          <div className="workflow-actions">
            <Link to="/company-profile" className="btn-text">Company profile</Link>
            <Link to="/hire" className="btn-text">Browse devs</Link>
            <Link to="/company-chat" className="btn-primary company">Open chats</Link>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        {/* Ledger row — single strip, 4 cells */}
        <div className="ledger-row" aria-label="Company hiring metrics">
          <div className="ledger-cell">
            <span className="ledger-number">{stats.contacted}</span>
            <span className="ledger-label">Contacted</span>
          </div>
          <div className="ledger-cell">
            <span className="ledger-number">{stats.replied}</span>
            <span className="ledger-label">Replied</span>
          </div>
          <div className="ledger-cell">
            <span className="ledger-number">{stats.replyRate}%</span>
            <span className="ledger-label">Reply rate</span>
          </div>
          <div className="ledger-cell">
            <span className="ledger-number">{stats.activeChats}</span>
            <span className="ledger-label">Active chats</span>
          </div>
        </div>

        <div className="dashboard-two-col">
          <section className="panel">
            <div className="panel-header">
              <h2>Phase breakdown</h2>
              <span>{developers.length} profiles</span>
            </div>
            {/* Stepped pipeline tracker */}
            <PipelineTracker phases={stageCounts} />
            <div className="stage-list" style={{ marginTop: "16px" }}>
              {stageCounts.map(({ stage, count }) => (
                <div
                  key={stage}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "8px",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--line)",
                    fontSize: "14px",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>{stage}</span>
                  <strong style={{ fontFamily: "var(--font-display)", fontSize: "16px" }}>{count}</strong>
                </div>
              ))}
              {stageCounts.length === 0 && (
                <p className="empty-note">No active pipeline stages yet.</p>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>Profile updates</h2>
            </div>
            <div className="notification-list">
              {developers.length > 0 ? (
                developers.slice(0, 8).map((developer) => (
                  <article className="notification-item" key={developer.id}>
                    <strong>{developer.name}</strong>
                    <p>{developer.bio || "Profile details are available."}</p>
                    <span>{developer.availability || "Availability not provided"}</span>
                  </article>
                ))
              ) : (
                <p className="empty-note">No developer profiles found.</p>
              )}
            </div>
          </section>
        </div>

        <section className="panel">
          <div className="panel-header">
            <h2>Candidate pipeline</h2>
            <Link to="/company-chat" className="text-button">Manage conversations</Link>
          </div>
          <div className="pipeline-table">
            <div className="table-row table-head">
              <span>Developer</span>
              <span>Role</span>
              <span>Phase</span>
              <span>Status</span>
            </div>
            {developers.map((dev) => (
              <div className="table-row" key={dev.id}>
                <span className="person-cell">
                  <span className="avatar-token">{dev.initials}</span>
                  {dev.name}
                </span>
                <span>{dev.title}</span>
                <span>
                  <span className="phase-label">
                    {chatByDeveloper.get(String(dev.id))?.phase || "No active chat"}
                  </span>
                </span>
                <span>{dev.availability || "Available"}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default CompanyDashboard;
