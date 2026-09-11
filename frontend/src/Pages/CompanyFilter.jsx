import React, { useState } from "react";
import { Link } from "react-router-dom";

const CompanyFilter = () => {
  const [filters, setFilters] = useState({
    level: "All",
    stack: "All",
    country: "All",
    availability: "All",
  });

  // Hardcoded dev pool
  const allDevs = [
    { id: 1, name: "Sarthak Thakur", title: "Full Stack Developer", level: "Junior", experience: "2 years", country: "India", city: "Kolkata", skills: ["React", "Node.js", "MongoDB", "Express"], avatar: "👨‍💻", availability: "Immediately" },
    { id: 2, name: "Emily Chen", title: "Frontend Developer", level: "Mid", experience: "4 years", country: "USA", city: "San Francisco", skills: ["React", "TypeScript", "Next.js", "Tailwind"], avatar: "👩‍💻", availability: "Within 2 weeks" },
    { id: 3, name: "Arjun Patel", title: "Backend Developer", level: "Senior", experience: "7 years", country: "India", city: "Mumbai", skills: ["Python", "Django", "PostgreSQL", "AWS", "Docker"], avatar: "🧑‍💻", availability: "Within 1 month" },
    { id: 4, name: "Sofia Martinez", title: "Full Stack Developer", level: "Mid", experience: "3 years", country: "Spain", city: "Barcelona", skills: ["Vue.js", "Node.js", "Firebase", "GraphQL"], avatar: "👩‍💻", availability: "Immediately" },
    { id: 5, name: "James Okonkwo", title: "DevOps Engineer", level: "Senior", experience: "6 years", country: "Nigeria", city: "Lagos", skills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Docker"], avatar: "🧑‍💻", availability: "Within 2 weeks" },
    { id: 6, name: "Anna Kowalski", title: "Mobile Developer", level: "Junior", experience: "1 year", country: "Poland", city: "Warsaw", skills: ["React Native", "JavaScript", "Firebase"], avatar: "👩‍💻", availability: "Immediately" },
  ];

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ level: "All", stack: "All", country: "All", availability: "All" });
  };

  // Filter logic
  const filteredDevs = allDevs.filter((dev) => {
    if (filters.level !== "All" && dev.level !== filters.level) return false;
    if (filters.country !== "All" && dev.country !== filters.country) return false;
    if (filters.availability !== "All" && dev.availability !== filters.availability) return false;
    if (filters.stack !== "All" && !dev.skills.some((s) => s.toLowerCase().includes(filters.stack.toLowerCase()))) return false;
    return true;
  });

  // Unique values for dropdowns
  const countries = [...new Set(allDevs.map((d) => d.country))];
  const stacks = [...new Set(allDevs.flatMap((d) => d.skills))];

  return (
    <div className="filter-container">
      <div className="container">
        <div className="filter-header">
          <div>
            <h1 className="filter-title">Find the Right Developer</h1>
            <p className="filter-subtitle">Filter by experience level, tech stack, country, and availability</p>
          </div>
          <Link to="/hire" className="btn-outline">← Back to all devs</Link>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar card">
          <div className="filter-group">
            <label>Experience Level</label>
            <select name="level" value={filters.level} onChange={handleFilterChange}>
              <option>All</option>
              <option>Junior</option>
              <option>Mid</option>
              <option>Senior</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Tech Stack</label>
            <select name="stack" value={filters.stack} onChange={handleFilterChange}>
              <option>All</option>
              {stacks.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Country</label>
            <select name="country" value={filters.country} onChange={handleFilterChange}>
              <option>All</option>
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Availability</label>
            <select name="availability" value={filters.availability} onChange={handleFilterChange}>
              <option>All</option>
              <option>Immediately</option>
              <option>Within 2 weeks</option>
              <option>Within 1 month</option>
            </select>
          </div>

          <button className="btn-outline btn-sm filter-clear-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        {/* Results Count */}
        <p className="filter-results-count">
          Showing <strong>{filteredDevs.length}</strong> of {allDevs.length} developers
        </p>

        {/* Results Grid */}
        <div className="hire-grid">
          {filteredDevs.length > 0 ? (
            filteredDevs.map((dev) => (
              <div className="hire-card card" key={dev.id}>
                <div className="hire-card-top">
                  <div className="hire-card-avatar">{dev.avatar}</div>
                  <div>
                    <h3 className="hire-card-name">{dev.name}</h3>
                    <p className="hire-card-title">{dev.title}</p>
                  </div>
                </div>

                <div className="hire-card-skills">
                  {dev.skills.map((skill) => (
                    <span className="skill-tag" key={skill}>{skill}</span>
                  ))}
                </div>

                <div className="hire-card-meta">
                  <span>📍 {dev.city}, {dev.country}</span>
                  <span>📊 {dev.level} • {dev.experience}</span>
                  <span className={`hire-avail ${dev.availability === "Immediately" ? "avail-now" : ""}`}>
                    ⏰ {dev.availability}
                  </span>
                </div>

                <div className="hire-card-actions">
                  <button className="btn-primary btn-sm">View Profile</button>
                  <Link to="/company-chat" className="btn-outline btn-sm">Message</Link>
                </div>
              </div>
            ))
          ) : (
            <div className="filter-empty">
              <p>No developers match your filters. Try adjusting your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyFilter;
