import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, MessageSquare, TrendingUp, Users } from "lucide-react";
import { apiRequest, getAuth } from "../api";

const CompanyDashboard = () => {
  const account = getAuth();
  const [developers, setDevelopers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!account?.id) return;
    Promise.all([
      apiRequest("/developers"),
      apiRequest(`/chats?accountId=${account.id}&role=company`),
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
  }, [developers, conversations]);

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
            <span className="eyebrow">Company dashboard</span>
            <h1>Hiring pipeline</h1>
            <p>Track contacted developers, replies, and where each candidate sits in the process.</p>
          </div>
          <div className="workflow-actions">
            <Link to="/company-profile" className="btn-secondary-action">Company profile</Link>
            <Link to="/hire" className="btn-secondary-action">Browse devs</Link>
            <Link to="/company-chat" className="btn-primary-action">Open chats</Link>
          </div>
        </header>

        {error && <div className="error-banner">{error}</div>}

        <section className="metric-grid" aria-label="Company hiring metrics">
          <article className="metric-card">
            <Users size={20} />
            <span>Contacted</span>
            <strong>{stats.contacted}</strong>
          </article>
          <article className="metric-card">
            <MessageSquare size={20} />
            <span>Replied</span>
            <strong>{stats.replied}</strong>
          </article>
          <article className="metric-card">
            <TrendingUp size={20} />
            <span>Reply rate</span>
            <strong>{stats.replyRate}%</strong>
          </article>
          <article className="metric-card">
            <Bell size={20} />
            <span>Active chats</span>
            <strong>{stats.activeChats}</strong>
          </article>
        </section>

        <div className="dashboard-two-col">
          <section className="panel">
            <div className="panel-header">
              <h2>Phase breakdown</h2>
              <span>{developers.length} profiles</span>
            </div>
            <div className="stage-list">
              {stageCounts.map(({ stage, count }) => (
                <div className="stage-row" key={stage}>
                  <span>{stage}</span>
                  <div className="stage-meter" aria-hidden="true">
                    <span style={{ width: `${(count / developers.length) * 100}%` }} />
                  </div>
                  <strong>{count}</strong>
                </div>
              ))}
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
                <span className="person-cell"><span className="avatar-token">{dev.initials}</span>{dev.name}</span>
                <span>{dev.title}</span>
                <span><span className="phase-pill">{chatByDeveloper.get(String(dev.id))?.phase || "No active chat"}</span></span>
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
