import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Doctors from './pages/Doctors.jsx';
import BookAppointment from './pages/BookAppointment.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import LabUpload from './pages/LabUpload.jsx';
import EquipmentAvailability from './pages/EquipmentAvailability.jsx';
import NotificationBell from './components/NotificationBell.jsx';
import './App.css';

function App() {
  const [appointments, setAppointments] = useState([]);

  const handleCreateAppointment = (appointment) => {
    setAppointments((prev) => [...prev, appointment]);
  };

  const doctorsData = [
    {
      id: 'd1',
      name: 'Dr. Ahsan Karim',
      speciality: 'Cardiologist',
      slots: ['09:00', '10:00', '11:00'],
    },
    {
      id: 'd2',
      name: 'Dr. Sara Rahman',
      speciality: 'Dermatologist',
      slots: ['12:00', '13:00', '15:00'],
    },
    {
      id: 'd3',
      name: 'Dr. Imran Hossain',
      speciality: 'Neurologist',
      slots: ['10:30', '11:30', '16:00'],
    },
  ];

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo">
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.125rem',
              fontWeight: 300,
              flexShrink: 0
            }}>+</div>
            <span>Hospital Management System</span>
          </div>
          <div className="nav-links">
            <NavLink className="nav-link" to="/" end>Home</NavLink>
            <NavLink className="nav-link" to="/doctors">Doctors & Slots</NavLink>
            <NavLink className="nav-link" to="/book">Book Appointment</NavLink>
            <NavLink className="nav-link" to="/dashboard">My Appointments</NavLink>
            <NavLink className="nav-link" to="/lab-upload">Lab Upload</NavLink>
            <NavLink className="nav-link" to="/equipment">Equipment</NavLink>
            <NotificationBell />
          </div>
        </div>
      </nav>

      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors doctors={doctorsData} />} />
          <Route
            path="/book"
            element={
              <BookAppointment
                doctors={doctorsData}
                onCreateAppointment={handleCreateAppointment}
              />
            }
          />
          <Route
            path="/dashboard"
            element={<PatientDashboard appointments={appointments} />}
          />
          <Route path="/lab-upload" element={<LabUpload />} />
          <Route path="/equipment" element={<EquipmentAvailability />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
