import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";
import './Landing.css';

function Landing() {
  const navigate = useNavigate();
  return (
    <div className="landing-wrapper">
      <div className="animated-background"></div>

      <div className="landing-container">
        <header className="landing-header">
          <img src={logo} alt="Logo" className="landing-logo" />
          <div className="auth-buttons">
            <button className="btn login" onClick={() => navigate('/login')}>Login</button>
            <button className="btn signup" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </header>

        <main className="landing-main">
          <h1 className="main-title">Group to Go - GTG!</h1>
          <p className="main-subtitle">
            All-in-one platform for planning, scheduling, and collaborating effortlessly.
          </p>

          <div className="features-grid">
            <div className="feature-box">Group Creating</div>
            <div className="feature-box">Event Planning</div>
            <div className="feature-box">Scheduling</div>
            <div className="feature-box">Expense Tracking</div>
            <div className="feature-box">Polls</div>
            <div className="feature-box">Maps</div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Landing;
