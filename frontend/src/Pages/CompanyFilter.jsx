import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, MessageSquare, Search } from "lucide-react";
import { apiRequest, getAuth } from "../api";

const CompanyFilter = () => {
  const [filters, setFilters] = useState({
    search: "",
    level: "All",
    stack: "All",
    country: "All",
    availability: "All",
  });
  const [developers, setDevelopers] = useState([]);
  const [error, setError] = useState("");
  const account = getAuth();

  useEffect(() => {
    apiRequest("/developers")
      .then(setDevelopers)
      .catch((requestError) => setError(requestError.message));
  }, []);

  const countries = useMemo(() => [...new Set(developers.map((dev) => dev.country))], []);
  const stacks = useMemo(() => [...new Set(developers.flatMap((dev) => dev.skills))], []);

  const updateFilter = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const clearFilters = () => {
    setFilters({ search: "", level: "All", stack: "All", country: "All", availability: "All" });
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

  const filteredDevs = developers.filter((dev) => {
    const search = filters.search.toLowerCase();
    const searchable = `${dev.name} ${dev.title} ${dev.city} ${dev.country} ${dev.skills.join(" ")}`.toLowerCase();

    return (
      (!search || searchable.includes(search)) &&
      (filters.level === "All" || dev.level === filters.level) &&
      (filters.country === "All" || dev.country === filters.country) &&
      (filters.availability === "All" || dev.availability === filters.availability) &&
      (filters.stack === "All" || dev.skills.includes(filters.stack))
    );
  });

  return (
    <main className="workflow-page">
      <div className="workflow-shell">
        <header className="workflow-header">
          <div>
            <span className="eyebrow">Advanced search</span>
            <h1>Filter developers</h1>
            <p>Narrow the company feed by experience, tech stack, location, and availability.</p>
          </div>
          <div className="workflow-actions">
            <Link to="/hire" className="btn-secondary-action"><ArrowLeft size={16} /> Back to feed</Link>
            <Link to="/company-chat" className="btn-primary-action"><MessageSquare size={16} /> Chats</Link>
          </div>
        </header>

        <section className="filter-strip filter-strip-wide">
          <label className="search-field">
            <Search size={16} />
            <input
              name="search"
              value={filters.search}
              onChange={updateFilter}
              placeholder="Search developers"
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
          <select name="country" value={filters.country} onChange={updateFilter}>
            <option>All</option>
            {countries.map((country) => <option key={country}>{country}</option>)}
          </select>
          <select name="availability" value={filters.availability} onChange={updateFilter}>
            <option>All</option>
            <option>Immediately</option>
            <option>Within 2 weeks</option>
            <option>Within 1 month</option>
          </select>
          <button className="btn-secondary-action" type="button" onClick={clearFilters}>
            Clear
          </button>
        </section>

        <p className="result-line">Showing {filteredDevs.length} of {developers.length} developers</p>
        {error && <div className="error-banner">{error}</div>}

        <div className="hire-grid">
          {filteredDevs.length > 0 ? (
            filteredDevs.map((dev) => (
              <article className="hire-card" key={dev.id}>
                <div className="hire-card-top">
                  <div className="hire-card-avatar">{dev.initials}</div>
                  <div>
                    <h3 className="hire-card-name">{dev.name}</h3>
                    <p className="hire-card-title">{dev.title}</p>
                  </div>
                </div>

                <div className="hire-card-skills">
                  {dev.skills.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}
                </div>

                <div className="hire-card-meta">
                  <span><MapPin size={14} /> {dev.city}, {dev.country}</span>
                  <span>{dev.level} / {dev.experience}</span>
                  <span className={`hire-avail ${dev.availability === "Immediately" ? "avail-now" : ""}`}>
                    {dev.availability}
                  </span>
                </div>

                <div className="phase-line">
                  <span>Phase</span>
                  <strong>{dev.phase}</strong>
                </div>

                <div className="hire-card-actions">
                  <button className="btn-secondary-action btn-sm" type="button">View profile</button>
                  <button type="button" className="btn-primary-action btn-sm" onClick={() => contactDeveloper(dev.id)}>Message</button>
                </div>
              </article>
            ))
          ) : (
            <div className="panel empty-panel">
              <p>No developers match your filters. Try a broader search.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default CompanyFilter;
