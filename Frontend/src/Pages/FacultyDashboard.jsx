import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './FacultyDashboard.css';

const FacultyDashboard = () => {
    const location = useLocation();
    const { user } = location.state || {};
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [students, setStudents] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.FacultyID) {
          axios.get(`http://localhost:3007/api/faculty/semesters/${user.FacultyID}`)
            .then(response => {
              const data = response.data.semesters;
              if (Array.isArray(data)) {
                setSemesters(data);
              } else {
                setSemesters([data]);
              }
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

    useEffect(() => {
        if (selectedSemester) {
            axios.get(`http://localhost:3007/api/faculty/students/${user.FacultyID}/${selectedSemester}`)
                .then(response => {
                    const data = response.data.students;
                    if (Array.isArray(data)) {
                        setStudents(data);
                    } else {
                        setStudents([data]);
                    }
                })
                .catch(error => {
                    setError('An error occurred while fetching students.');
                });
        } else {
            setStudents([]);
        }
    }, [selectedSemester, user]);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:3007/api/logout');
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error.response ? error.response.data.error : error.message);
        }
    };

    const handleChangePassword = () => {
        navigate('/ChangePassword', { state: { userId: user.FacultyID, role: 'faculty' } });
    };

    return (
        <div className="FDcontainer">
            <div className="navbar">
                <ul>
                    <li><button onClick={() => {}}>View Students</button></li>
                    <li><button onClick={handleChangePassword}>Change Password</button></li>
                    <li><button onClick={handleLogout}>Logout</button></li>
                </ul>
            </div>
            <div className="main-content">
                <div className="sidebar">
                    <h2>Select Semester</h2>
                    <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}>
                        <option value="">--Select a Semester--</option>
                        {semesters.map((semester, index) => (
                            <option key={index} value={semester.Semester}>
                                {semester.Semester}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="content">
                    {students.length > 0 ? (
                        <div>
                            <h3>Assigned Students</h3>
                            {students.map((student, index) => (
                                <div key={index} className="student-info">
                                    <p>Semester: {student.Semester}</p>
                                    <p>Course: {student.Title}</p>
                                    <p>Student ID: {student.StudentId}</p>
                                    <p>Student Name: {student.StudentName}</p>
                                    <p>Submission Status: {student.SubmissionStatus}</p>
                                    {student.FilePath && (
                                        <p>
                                            Submitted File: <a href={`http://localhost:3007/${student.FilePath}`} download>Download</a>
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>{error || 'No students found for the selected semester.'}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
