import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        const response = await axios.get('http://localhost:3000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    };
    
    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user.displayName || user.username}</h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
      
      <div className="profile-card">
        <div className="profile-header">
          {user.photos && user.photos.length > 0 && (
            <img 
              src={user.photos[0].value} 
              alt="Profile" 
              className="profile-image" 
            />
          )}
          <div>
            <h2>{user.displayName || user.username}</h2>
            <p className="username">@{user.username}</p>
            {user.email && <p className="email">{user.email}</p>}
          </div>
        </div>
        
        <div className="profile-info">
          <p>
            GitHub Profile: 
            <a 
              href={user.profileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View Profile
            </a>
          </p>
          <p>Account created: {new Date(user.created).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;