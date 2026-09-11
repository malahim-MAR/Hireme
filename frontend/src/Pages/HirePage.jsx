import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, MapPin, MessageSquare, Search, SlidersHorizontal } from "lucide-react";
import { apiRequest, getAuth } from "../api";

const HirePage = () => {
  const [filters, setFilters] = useState({
    search: "",
    level: "All",
    availability: "All",
    stack: "All",
  });
  const [developers, setDevelopers] = useState([]);
  const [error, setError] = useState("");
  const account = getAuth();

  useEffect(() => {
    apiRequest("/developers")
      .then(setDevelopers)
      .catch((requestError) => setError(requestError.message));
  }, []);

  const stacks = useMemo(() => [...new Set(developers.flatMap((dev) => dev.skills))], []);

  const filteredDevelopers = developers.filter((dev) => {
    const search = filters.search.toLowerCase();
    const searchable = `${dev.name} ${dev.title} ${dev.city} ${dev.country} ${dev.skills.join(" ")}`.toLowerCase();

    return (
      (!search || searchable.includes(search)) &&
      (filters.level === "All" || dev.level === filters.level) &&
      (filters.availability === "All" || dev.availability === filters.availability) &&
      (filters.stack === "All" || dev.skills.includes(filters.stack))
    );
  });

  const updateFilter = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const contactDeveloper = async (developerId) => {
    try {
      await apiRequest("/chats", {
        method: "POST",
        body: JSON.stringify({ accountId: account?.id, role: "company", developerId }),
      });
      window.location.href = "/company-chat";
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="workflow-page">
      <div className="workflow-shell">
        <header className="workflow-header">
          <div>
            <span className="eyebrow">Company feed</span>
            <h1>Browse developer profiles</h1>
            <p>Review talent cards, apply a brief filter, and start conversations from the feed.</p>
          </div>
          <div className="workflow-actions">
            <Link to="/company-dashboard" className="btn-secondary-action">Dashboard</Link>
            <Link to="/company-chat" className="btn-primary-action"><MessageSquare size={16} /> Messages</Link>
          </div>
        </header>

        <section className="filter-strip">
          <label className="search-field">
            <Search size={16} />
            <input
              name="search"
              value={filters.search}
              onChange={updateFilter}
              placeholder="Search name, role, country, or skill"
            />
          </label>
          <select name="level" value={filters.level} onChange={updateFilter}>
            <option>All</option>
            <option>Junior</option>
            <option>Mid</option>
            <option>Senior</option>
          </select>
          <select name="stack" value={filters.stack} onChange={updateFilter}>
            <option>All</option>
            {stacks.map((stack) => <option key={stack}>{stack}</option>)}
          </select>
          <select name="availability" value={filters.availability} onChange={updateFilter}>
            <option>All</option>
            <option>Immediately</option>
            <option>Within 2 weeks</option>
            <option>Within 1 month</option>
          </select>
          <Link to="/company-filter" className="btn-secondary-action"><SlidersHorizontal size={16} /> More filters</Link>
        </section>

        <div className="result-line">
          <Filter size={16} />
          <span>{filteredDevelopers.length} of {developers.length} developers shown</span>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="hire-grid">
          {filteredDevelopers.map((dev) => (
            <article className="hire-card" key={dev.id}>
              <div className="hire-card-top">
                <div className="hire-card-avatar">{dev.initials}</div>
                <div>
                  <h3 className="hire-card-name">{dev.name}</h3>
                  <p className="hire-card-title">{dev.title}</p>
                </div>
              </div>

              <p className="hire-card-bio">{dev.bio}</p>

              <div className="hire-card-skills">
                {dev.skills.map((skill) => (
                  <span className="skill-tag" key={skill}>{skill}</span>
                ))}
              </div>

              <div className="hire-card-meta">
                <span><MapPin size={14} /> {dev.city}, {dev.country}</span>
                <span>{dev.level} / {dev.experience}</span>
                <span className={`hire-avail ${dev.availability === "Immediately" ? "avail-now" : ""}`}>
                  {dev.availability}
                </span>
              </div>

              <div className="phase-line">
                <span>Current phase</span>
                <strong>{dev.availability || "Profile available"}</strong>
              </div>

              <div className="hire-card-actions">
                <button className="btn-secondary-action btn-sm" type="button">View profile</button>
                <button type="button" className="btn-primary-action btn-sm" onClick={() => contactDeveloper(dev.id)}>Contact</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default HirePage;
