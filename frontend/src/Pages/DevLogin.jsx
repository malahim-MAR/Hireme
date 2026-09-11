import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DevLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/auth/developer/login" : "/api/auth/developer/signup";
    try {
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(`${isLogin ? "Login" : "Signup"} successful:`, data);
        navigate("/dev-profile");
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to server");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {isLogin ? "Welcome Back" : "Join ThinkBoard"}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? "Stay updated on your professional world"
              : "Make the most of your professional life"}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Ex: John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {isLogin && (
            <div className="auth-forgot">
              <a href="#">Forgot password?</a>
            </div>
          )}

          <button type="submit" className="auth-btn">
            {isLogin ? "Sign in" : "Agree & Join"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-toggle">
          {isLogin ? (
            <p>
              New to ThinkBoard?{" "}
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setIsLogin(false)}
              >
                Join now
              </button>
            </p>
          ) : (
            <p>
              Already on ThinkBoard?{" "}
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setIsLogin(true)}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevLogin;
