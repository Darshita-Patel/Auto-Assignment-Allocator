const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require('body-parser');
const session = require("express-session");
const cookieparser = require("cookie-parser");
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3007;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieparser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: "abcd"
}));

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "Internship",
  port: 3307
};

const pool = mysql.createPool(dbConfig);

// Setting up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Check if the user is a student
    const studentQuery = 'SELECT * FROM studentinfo WHERE Email = ? AND Password = ?';
    pool.query(studentQuery, [email, password], (err, studentResults) => {
        if (err) {
            console.error('Error fetching student data:', err);
            return res.status(500).json({ error: 'An error occurred while fetching student data.' });
        }

        if (studentResults.length > 0) {
            // User is a student
            req.session.user = {
                id: studentResults[0].StudentId,
                email: studentResults[0].Email,
                name: studentResults[0].StudentName,
                role: 'student'
            };
            return res.status(200).json({ role: 'student', user: studentResults[0] });
        } else {
            // Check if the user is a faculty
            const facultyQuery = 'SELECT * FROM facultyinfo WHERE Email = ? AND Password = ?';
            pool.query(facultyQuery, [email, password], (err, facultyResults) => {
                if (err) {
                    console.error('Error fetching faculty data:', err);
                    return res.status(500).json({ error: 'An error occurred while fetching faculty data.' });
                }

                if (facultyResults.length > 0) {
                    // User is a faculty
                    req.session.user = {
                        id: facultyResults[0].FacultyID,
                        email: facultyResults[0].Email,
                        name: facultyResults[0].FacultyName,
                        role: 'faculty'
                    };
                    return res.status(200).json({ role: 'faculty', user: facultyResults[0] });
                } else {
                    return res.status(401).json({ error: 'Invalid email or password.' });
                }
            });
        }
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).json({ error: 'An error occurred during logout.' });
        }

        res.status(200).json({ message: 'Logout successful' });
    });
});

app.post('/api/assign-question', (req, res) => {
  const { StudentId } = req.body;

  // Check if the student already has an assigned question
  const checkQuery = 'SELECT * FROM assignment_allocation WHERE StudentId = ?';
  pool.query(checkQuery, [StudentId], (err, results) => {
    if (err) {
      console.error('Error checking assignment allocation:', err);
      return res.status(500).json({ error: 'An error occurred while checking assignment allocation.' });
    }

    if (results.length > 0) {
      // The student already has an assigned question
      return res.status(200).json({ message: 'Student already has an assigned question.' });
    }

    // Find the courses taken by the student
    const courseQuery = 'SELECT CourseID FROM takes WHERE StudentId = ?';
    pool.query(courseQuery, [StudentId], (err, courseResults) => {
      if (err) {
        console.error('Error fetching courses taken by student:', err);
        return res.status(500).json({ error: 'An error occurred while fetching courses taken by student.' });
      }

      if (courseResults.length === 0) {
        return res.status(404).json({ error: 'No courses found for the student.' });
      }

      // Assign a question for each course taken by the student
      const assignments = [];

      courseResults.forEach((course, index) => {
        const courseId = course.CourseID;

        // Find the faculty teaching the course for the student's batch
        const facultyQuery = `
        SELECT f.FacultyID FROM facultyinfo f JOIN teaches t ON f.FacultyID = t.FacultyID JOIN takes ta ON t.CourseID = ta.CourseID WHERE ta.StudentId = ? AND ta.CourseID = ?`;

        pool.query(facultyQuery, [StudentId, courseId], (err, facultyResults) => {
          if (err) {
            console.error('Error fetching faculty teaching the course:', err);
            return res.status(500).json({ error: 'An error occurred while fetching faculty teaching the course.' });
          }

          if (facultyResults.length === 0) {
            console.error('No faculty found teaching the course for the student\'s batch:', courseId);
            return;
          }

          const facultyId = facultyResults[0].FacultyID;

          // Assign a new question to the student for this course
          const selectQuery = 'SELECT * FROM assignment WHERE Flag = 0 AND CourseID = ? LIMIT 1';
          pool.query(selectQuery, [courseId], (err, assignmentResults) => {
            if (err) {
              console.error('Error selecting assignment:', err);
              return;
            }

            if (assignmentResults.length === 0) {
              console.error('No available assignments to assign for course:', courseId);
              return;
            }

            const assignment = assignmentResults[0];
            const insertQuery = 'INSERT INTO assignment_allocation (StudentId, AssignmentID, FacultyID, FilePath) VALUES (?, ?, ?, ?)';
            pool.query(insertQuery, [StudentId, assignment.AssignmentID, facultyId,''], (err, insertResults) => {
              if (err) {
                console.error('Error inserting assignment allocation:', err);
                return;
              }

              // Update the assignment flag
              const updateQuery = 'UPDATE assignment SET Flag = 1 WHERE AssignmentID = ?';
              pool.query(updateQuery, [assignment.AssignmentID], (err, updateResults) => {
                if (err) {
                  console.error('Error updating assignment flag:', err);
                  return;
                }

                //Get Course Title
                const fetchQuery = 'Select Title from courses where CourseID = ?';
                pool.query(fetchQuery, [courseId], (err, fetchResults) => {
                  if (err) {
                    console.error('Error updating assignment flag:', err);
                    return;
                  }

                  assignments.push({
                    AssignmentQue: assignment.AssignmentQue,
                    FacultyName: assignment.FacultyName,
                    Title: fetchResults[0].Title
                  });

                  // Send response after all courses are processed
                  if (index === courseResults.length - 1) {
                    return res.status(200).json({ message: 'Assignments assigned successfully.', assignments });
                  }
                });
              });
            });
          });
        });
      });
    });
  });
});

app.get('/api/student/courses/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  const query = 'SELECT DISTINCT t.CourseID, c.Title FROM takes t join courses c on t.CourseID = c.CourseID WHERE t.StudentId = ?';
  pool.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching courses:', err);
      return res.status(500).json({ error: 'An error occurred while fetching courses.' });
    }
    res.status(200).json({ courses: results });
  });
});

app.get('/api/student/assignments/:studentId/:courseId', (req, res) => {
  const studentId = req.params.studentId;
  const courseId = req.params.courseId;

  const query = 'SELECT a.AssignmentQue, a.AssignmentID, f.FacultyName,aa.Status, aa.FilePath, c.Title as CourseTitle FROM assignment_allocation aa JOIN assignment a ON aa.AssignmentID = a.AssignmentID JOIN facultyinfo f ON aa.FacultyID = f.FacultyID JOIN courses c ON a.CourseID = c.CourseID WHERE aa.StudentId = ? and a.CourseID=?';
  pool.query(query, [studentId, courseId], (err, results) => {
    if (err) {
      console.error('Error fetching assignments:', err);
      return res.status(500).json({ error: 'An error occurred while fetching assignments.' });
    }
    res.status(200).json({ assignments: results });
  });
});

app.get('/api/faculty/semesters/:facultyID', (req, res) => {
  const { facultyID } = req.params;

  const query = 'SELECT DISTINCT Semester FROM teaches WHERE FacultyID = ?';
  pool.query(query, [facultyID], (err, results) => {
    if (err) {
      console.error('Error fetching semesters:', err);
      return res.status(500).json({ error: 'An error occurred while fetching semesters.' });
    }
    res.status(200).json({ semesters: results });
  });
});

app.get('/api/faculty/students/:facultyID/:semester', (req, res) => {
  const { facultyID, semester } = req.params;

  const query = `SELECT DISTINCT s.StudentId, s.StudentName, c.Title, aa.FilePath, t.Semester, CASE WHEN aa.Status = 1 THEN 'Submitted' ELSE 'Not Submitted' END as SubmissionStatus FROM teaches t JOIN takes ta ON t.CourseID = ta.CourseID JOIN courses c ON t.CourseID = c.CourseID JOIN studentinfo s ON ta.StudentId = s.StudentId JOIN assignment_allocation aa ON s.StudentId = aa.StudentId AND aa.FacultyID=? WHERE t.FacultyID = ? AND ta.Semester=?`;
  pool.query(query, [facultyID,facultyID,semester], (err, results) => {
    if (err) {
      console.error('Error fetching assignments:', err);
      return res.status(500).json({ error: 'An error occurred while fetching students.' });
    }
    res.status(200).json({ students: results });
  });
});

// Upload assignment
app.post('/api/upload-assignment', upload.single('file'), (req, res) => {
  const { studentId, assignmentId } = req.body;
  const filePath = req.file.path;
  const query = 'UPDATE assignment_allocation SET FilePath = ?, Status = 1 WHERE StudentId = ? AND AssignmentID = ?';
  pool.query(query, [filePath, studentId,assignmentId], (err, results) => {
    if (err) {
      console.error('Error uploading assignment:', err);
      return res.status(500).json({ error: 'An error occurred while uploading the assignment.' });
    }
    res.status(200).json({ message: 'Assignment uploaded successfully.' });
  });
});

app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);
  res.sendFile(filepath);
});

// Route for adding new student
app.post('/api/students', async (req, res) => {
  try {
      const { studentId,studentName, department, email, dob, batch } = req.body;
      const dobDate = new Date(dob);
      const password = `${('0' + dobDate.getDate()).slice(-2)}${('0' + (dobDate.getMonth() + 1)).slice(-2)}${dobDate.getFullYear()}`;

      // Insert the new student into the database
      const query = 'INSERT INTO studentinfo (StudentId,StudentName, Department, Email, DOB, Batch, Password) VALUES (?, ?, ?, ?, ?, ?, ?)';
      pool.query(query, [studentId,studentName, department, email, dob, batch, password], (err, result) => {
          if (err) {
              console.error(err);
              res.status(500).json({ error: 'An error occurred while adding the student.' });
          } else {
              res.status(201).json({ message: 'Student added successfully.' });
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred.' });
  }
});

// Route for adding new faculty
app.post('/api/faculty', async (req, res) => {
  try {
      const { facultyName, department, email, facultyId } = req.body;
      const password = facultyId; // Set initial password as Faculty ID

      // Insert the new faculty into the database
      const query = 'INSERT INTO facultyinfo (FacultyName, Department, Email, FacultyID, Password) VALUES (?, ?, ?, ?, ?)';
      pool.query(query, [facultyName, department, email, facultyId, password], (err, result) => {
          if (err) {
              console.error(err);
              res.status(500).json({ error: 'An error occurred while adding the faculty.' });
          } else {
              res.status(201).json({ message: 'Faculty added successfully.' });
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred.' });
  }
});

// Function to validate password
const validatePassword = (password) => {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,10}$/;
  return passwordPattern.test(password);
};

// Route for changing password
app.post('/api/change-password', async (req, res) => {
  const { userId, role, newPassword } = req.body;
  console.log(userId,role,newPassword);
  if (!validatePassword(newPassword)) {
    return res.status(400).json({ error: 'Password must be 6-10 characters long and include at least one lowercase letter, one uppercase letter, one numeric digit, and one special character.' });
  }

  const table = role === 'student' ? 'studentinfo' : 'facultyinfo';
  const idColumn = role === 'student' ? 'StudentId' : 'FacultyID';
  console.log(table,idColumn);

  const query = `UPDATE ${table} SET Password = ? WHERE ${idColumn} = ?`;
  console.log(query);

  pool.query(query, [newPassword, userId], (err, result) => {
    if (err) {
      console.error('Error changing password:', err);
      return res.status(500).json({ error: 'An error occurred while changing the password.' });
    }
    res.status(200).json({ message: 'Password changed successfully.' });
  });
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
