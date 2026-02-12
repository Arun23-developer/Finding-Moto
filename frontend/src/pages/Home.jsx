import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="home">
      <div className="header">
        <h1>Welcome to Finding Moto</h1>
        {user && (
          <div className="user-info">
            <p>Hello, {user.name}!</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
      <p>Your journey starts here.</p>
    </div>
  );
};

export default Home;
