import React, { useState } from "react";
import { Link } from "react-router-dom";

const HirePage = () => {
  // Hardcoded dev profiles
  const devProfiles = [
    {
      id: 1,
      name: "Sarthak Thakur",
      title: "Full Stack Developer",
      level: "Junior",
      experience: "2 years",
      country: "India",
      city: "Kolkata",
      skills: ["React", "Node.js", "MongoDB", "Express"],
      bio: "MERN stack developer passionate about building scalable web apps.",
      avatar: "👨‍💻",
      availability: "Immediately",
    },
    {
      id: 2,
      name: "Emily Chen",
      title: "Frontend Developer",
      level: "Mid",
      experience: "4 years",
      country: "USA",
      city: "San Francisco",
      skills: ["React", "TypeScript", "Next.js", "Tailwind"],
      bio: "UI/UX focused frontend engineer with a passion for pixel-perfect designs.",
      avatar: "👩‍💻",
      availability: "Within 2 weeks",
    },
    {
      id: 3,
      name: "Arjun Patel",
      title: "Backend Developer",
      level: "Senior",
      experience: "7 years",
      country: "India",
      city: "Mumbai",
      skills: ["Python", "Django", "PostgreSQL", "AWS", "Docker"],
      bio: "Experienced backend architect building high-traffic APIs and microservices.",
      avatar: "🧑‍💻",
      availability: "Within 1 month",
    },
    {
      id: 4,
      name: "Sofia Martinez",
      title: "Full Stack Developer",
      level: "Mid",
      experience: "3 years",
      country: "Spain",
      city: "Barcelona",
      skills: ["Vue.js", "Node.js", "Firebase", "GraphQL"],
      bio: "Creative developer blending design thinking with clean code.",
      avatar: "👩‍💻",
      availability: "Immediately",
    },
    {
      id: 5,
      name: "James Okonkwo",
      title: "DevOps Engineer",
      level: "Senior",
      experience: "6 years",
      country: "Nigeria",
      city: "Lagos",
      skills: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Docker"],
      bio: "Infrastructure specialist focused on cloud-native deployments and automation.",
      avatar: "🧑‍💻",
      availability: "Within 2 weeks",
    },
    {
      id: 6,
      name: "Anna Kowalski",
      title: "Mobile Developer",
      level: "Junior",
      experience: "1 year",
      country: "Poland",
      city: "Warsaw",
      skills: ["React Native", "JavaScript", "Firebase"],
      bio: "Eager mobile developer building cross-platform apps with React Native.",
      avatar: "👩‍💻",
      availability: "Immediately",
    },
  ];

  return (
    <div className="hire-container">
      <div className="container">
        <div className="hire-header">
          <div>
            <h1 className="hire-title">Hire Developers</h1>
            <p className="hire-subtitle">Browse talented developers ready to join your team</p>
          </div>
          <div className="hire-nav-links">
            <Link to="/company-filter" className="btn-primary">🔍 Filter Developers</Link>
            <Link to="/company-chat" className="btn-outline">💬 Messages</Link>
          </div>
        </div>

        <div className="hire-grid">
          {devProfiles.map((dev) => (
            <div className="hire-card card" key={dev.id}>
              <div className="hire-card-top">
                <div className="hire-card-avatar">{dev.avatar}</div>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default HirePage;
