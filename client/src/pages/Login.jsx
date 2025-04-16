import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle successful login redirect with token
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    
    if (token) {
      // Store token in localStorage
      localStorage.setItem('authToken', token);
      navigate('/dashboard');
    }
  }, [location, navigate]);

  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:3000/auth/github';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <p className="auth-description">
          Login to your account using GitHub
        </p>
        
        <button 
          className="github-button"
          onClick={handleGitHubLogin}
        >
          <i className="fab fa-github"></i> Login with GitHub
        </button>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;