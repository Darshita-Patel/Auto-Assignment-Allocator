import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import UploadAssignment from './UploadAssignment';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const location = useLocation();
  const { user } = location.state || {};
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.StudentId) {
      axios.post('http://localhost:3007/api/assign-question', { StudentId: user.StudentId })
        .then(() => {
          axios.get(`http://localhost:3007/api/student/courses/${user.StudentId}`)
            .then(response => {
              const data = response.data.courses;
              if (Array.isArray(data)) {
                setCourses(data);
              } else {
                setCourses([data]);
              }
            })
            .catch(error => {
              if (error.response && error.response.data) {
                setError(error.response.data.error);
              } else {
                setError('An error occurred. Please try again.');
              }
            });
        })
        .catch(error => {
          if (error.response && error.response.data) {
            setError(error.response.data.error);
          } else {
            setError('An error occurred. Please try again.');
          }
        });
    }
  }, [user]);

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    if (courseId) {
      axios.get(`http://localhost:3007/api/student/assignments/${user.StudentId}/${courseId}`)
        .then(response => {
          setAssignments(response.data.assignments);
        })
        .catch(error => {
          if (error.response && error.response.data) {
            setError(error.response.data.error);
          } else {
            setError('An error occurred. Please try again.');
          }
        });
    } else {
      setAssignments([]);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3007/api/logout');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error.response ? error.response.data.error : error.message);
    }
  };

  const handleChangePassword = () => {
    navigate('/ChangePassword', { state: { userId: user.StudentId, role: 'student' } });
  };

  return (
    <div className="SDcontainer">
      <div className="navbar">
        <ul>
          <li><button onClick={() => {}}>View Assignment</button></li>
          <li><button onClick={handleChangePassword}>Change Password</button></li>
          <li><button onClick={handleLogout}>Logout</button></li>
        </ul>
      </div>
      <div className="main-content">
        <div className="sidebar">
          <h2>Select Course</h2>
          <select value={selectedCourse} onChange={handleCourseChange}>
            <option value="">--Select a Course--</option>
            {courses.map((course, index) => (
              <option key={index} value={course.CourseID}>{course.Title}</option>
            ))}
          </select>
        </div>
        <div className="content">
          {assignments.length > 0 ? (
            <div>
              <h3>Assigned Question</h3>
              {assignments.map((assign, index) => (
                <div key={index} className="assignment">
                  <p>Course: {assign.CourseTitle}</p>
                  <p>Faculty Assigned: {assign.FacultyName}</p>
                  <p>Question: {assign.AssignmentQue}</p>
                  <p>Submission Status: {assign.Status ? "Submitted" : "Not Submitted"}</p>
                  {assign.FilePath && (
                    <p>
                      Submitted File: <a href={`http://localhost:3007/${assign.FilePath}`} download>Download</a>
                    </p>
                  )}
                  <UploadAssignment studentId={user.StudentId} assignmentId={assign.AssignmentID} />
                </div>
              ))}
            </div>
          ) : (
            <p>{error || 'No assignments found for the selected course.'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
