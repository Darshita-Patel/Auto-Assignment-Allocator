
# 📚 Auto Assignment Allocator

An automated assignment allocation system designed to simplify the process of distributing assignments to students based on their enrolled courses and faculties. The system supports three roles: Admin, Faculty, and Student, with a smooth interface and a powerful backend.

---

## 📌 Features

- 🔐 **Role-based login system**: Admin, Faculty, and Student  
- 🧑‍🏫 **Admin** can add new students and faculties  
- 🎯 **Automatic assignment allocation** based on course and faculty  
- 📤 **Students** can upload assignment submissions  
- 📥 **Faculties** can view and download student submissions  
- 🔁 **Password change** functionality  
- 📦 **File upload** support via multer  

---

## 🛠️ Tech Stack

### Backend:
- Node.js  
- Express.js  
- MySQL  
- Multer (for file uploads)  
- Session & Cookie management  

### Frontend:
- React.js  
- Axios  
- React Router DOM  

---

## 📂 Folder Structure

```
AutoAssignmentAllocator/
├── Backend/
│   └── server.js
│   └── uploads/ (assignment files)
├── Frontend/
│   └── src/
|       └── pages/
│           ├── AddStudent.jsx
│           ├── AddFaculty.jsx
│           ├── AdminDashboard.jsx
│           ├── FacultyDashboard.jsx
│           ├── StudentDashboard.jsx
│           ├── UploadAssignment.jsx
│           ├── ChangePassword.jsx
│           └── Login.jsx
└── README.md
```

---

## 🚀 Getting Started

### 🧠 Prerequisites

- Node.js installed  
- MySQL server running  
- `npm` and `react-scripts` for frontend  

### 🔧 Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install express mysql cors body-parser express-session cookie-parser multer
```

Create a MySQL database:

```sql
CREATE DATABASE Internship;
```

Set up your tables based on the system:

> Tables: `studentinfo`, `facultyinfo`, `assignment`, `assignment_allocation`, `courses`, `teaches`, `takes`

Start the backend server:

```bash
node server.js
```

### 🌐 Frontend Setup

Navigate to the frontend folder:

```bash
cd frontend
```

Install React dependencies:

```bash
npm install
npm install axios react-router-dom
```

Start the frontend app:

```bash
npm start
```

Open browser at: `http://localhost:3000`

---

## 🔐 Roles & Functionalities

### 👩‍💼 Admin
- Login using predefined credentials  
- Add new faculty and students  

### 🧑‍🏫 Faculty
- View students by semester  
- Download student submissions  
- Change password  

### 👩‍🎓 Student
- Auto-assigned assignments upon login  
- View assignments by course  
- Upload responses  
- Change password  

---

## 🔌 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Login for student/faculty |
| POST | `/api/logout` | Logout user |
| POST | `/api/assign-question` | Automatically assigns assignments |
| GET | `/api/student/courses/:studentId` | Fetch student’s enrolled courses |
| GET | `/api/student/assignments/:studentId/:courseId` | View assignments for a course |
| POST | `/api/upload-assignment` | Upload assignment file |
| POST | `/api/change-password` | Change password for student/faculty |
| POST | `/api/students` | Add new student |
| POST | `/api/faculty` | Add new faculty |
| GET | `/api/faculty/semesters/:facultyId` | Get semesters faculty is teaching |
| GET | `/api/faculty/students/:facultyId/:semester` | View students and their submission status |

---

## 🗃️ Database Tables (Overview)

- `studentinfo`: Student details  
- `facultyinfo`: Faculty details  
- `courses`: Course IDs and titles  
- `takes`: Mapping of students to courses  
- `teaches`: Mapping of faculties to courses  
- `assignment`: Questions per course  
- `assignment_allocation`: Links students to assignments, with status and file path  

---

## 🔒 Password Policy

For changing password, the new password must:

- Be 6–10 characters long  
- Include at least:
  - One uppercase letter  
  - One lowercase letter  
  - One number  
  - One special character  

---

## 🙋‍♀️ Author

**Darshita Patel**  
Frontend: React.js | Backend: Node.js, Express | DB: MySQL
