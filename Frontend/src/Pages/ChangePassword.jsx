import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './ChangePassword.css'; // Import the CSS file for styling

const ChangePassword = () => {
  const location = useLocation();
  const { userId, role } = location.state || {};
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New password and confirm password do not match.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3007/api/change-password', {
        userId,
        role,
        newPassword,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response ? error.response.data.error : 'An error occurred while changing the password.');
    }
  };

  const handleBack = () => {
    if (role === 'faculty') {
      navigate('/FacultyDashboard', { state: { user: { FacultyID: userId } } });
    } else if (role === 'student') {
      navigate('/StudentDashboard', { state: { user: { StudentId: userId } } });
    }
  };

  return (
    <div className="CPcontainer">
      <h3>Change Password</h3>
      <form onSubmit={handleChangePassword}>
        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Change Password</button>
      </form>
      {message && <div className="message">{message}</div>}
      <button className="back-button" onClick={handleBack}>Back</button>
    </div>
  );
};

export default ChangePassword;
