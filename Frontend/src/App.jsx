import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Pages/Login";
import StudentDashboard from "./Pages/StudentDashboard";
import FacultyDashboard from "./Pages/FacultyDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import ChangePassword from "./Pages/ChangePassword";
import AddStudent from './Pages/AddStudent';
import AddFaculty from './Pages/AddFaculty';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/StudentDashboard" element={<StudentDashboard />} />
          <Route path="/FacultyDashboard" element={<FacultyDashboard />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/ChangePassword" element={<ChangePassword />} />
          <Route path="/add-student" element={<AddStudent />} />
          <Route path="/add-faculty" element={<AddFaculty />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

