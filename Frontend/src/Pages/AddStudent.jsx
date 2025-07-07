import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './AddStudent.css';

const AddStudent = () => {
  const [studentDetails, setStudentDetails] = useState({
    studentId: '',
    studentName: '',
    department: '',
    email: '',
    dob: '',
    batch: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setStudentDetails({
      ...studentDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3007/api/students', studentDetails);
      setMessage(response.data.message);
      setStudentDetails({
        studentId: '',
        studentName: '',
        department: '',
        email: '',
        dob: '',
        batch: ''
      });
    } catch (error) {
      setMessage(error.response ? error.response.data.error : 'An error occurred while adding the student.');
    }
  };

  return (
    <div className="AScontainer">
      <h2>Add New Student</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Student ID:</label>
          <input
            type="text"
            name="studentId"
            value={studentDetails.studentId}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Student Name:</label>
          <input
            type="text"
            name="studentName"
            value={studentDetails.studentName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Department:</label>
          <input
            type="text"
            name="department"
            value={studentDetails.department}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={studentDetails.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Date of Birth:</label>
          <input
            type="date"
            name="dob"
            value={studentDetails.dob}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Batch:</label>
          <select
            name="batch"
            value={studentDetails.batch}
            onChange={handleChange}
            required
          >
            <option value="">--Select Batch--</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
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

export default AddStudent;
