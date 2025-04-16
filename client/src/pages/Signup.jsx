import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
  const handleGitHubSignup = () => {
    window.location.href = 'http://localhost:3000/auth/github';
  };

  return (
    <>
      <div className="header">
        <h1>Welcome to GitMeet</h1>
      </div>
      <div className="auth-container">
        <div className="auth-card">
          <h2>Sign Up</h2>
          <p className="auth-description">
            Create a new account using your GitHub account
          </p>

          <button
            className="github-button"
            onClick={handleGitHubSignup}
          >
            <i className="fab fa-github"></i> Sign up with GitHub
          </button>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;