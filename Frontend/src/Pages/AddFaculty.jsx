import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AddFaculty.css';

const AddFaculty = () => {
  const [facultyDetails, setFacultyDetails] = useState({
    facultyId: '',
    facultyName: '',
    department: '',
    email: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFacultyDetails({
      ...facultyDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3007/api/faculty', facultyDetails);
      setMessage(response.data.message);
      setFacultyDetails({
        facultyId: '',
        facultyName: '',
        department: '',
        email: ''
      });
    } catch (error) {
      setMessage(error.response ? error.response.data.error : 'An error occurred while adding the faculty.');
    }
  };

  return (
    <div className="AFcontainer">
      <h2>Add New Faculty</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Faculty ID:</label>
          <input
            type="text"
            name="facultyId"
            value={facultyDetails.facultyId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Faculty Name:</label>
          <input
            type="text"
            name="facultyName"
            value={facultyDetails.facultyName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Department:</label>
          <input
            type="text"
            name="department"
            value={facultyDetails.department}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={facultyDetails.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="button-group">
        <button type="submit" className="submit-button">Add Faculty</button>
        <Link to="/AdminDashboard" className="back-button">Back</Link>
        </div>
      </form>
      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default AddFaculty;
