import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3007/api/logout');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error.response ? error.response.data.error : error.message);
    }
  };

  return (
    <div className="ADContainer">
      <h2>Admin Dashboard</h2>
      <div className="options">
        <Link to="/add-student">
          <button className="dashboard-button">Add New Student</button>
        </Link>
        <Link to="/add-faculty">
          <button className="dashboard-button">Add New Faculty</button>
        </Link>
        <button className="dashboard-button" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
