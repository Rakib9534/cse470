import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Home from './pages/Home.jsx';
import Doctors from './pages/Doctors.jsx';
import BookAppointment from './pages/BookAppointment.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import PatientPortal from './pages/PatientPortal.jsx';
import LabUpload from './pages/LabUpload.jsx';
import EquipmentAvailability from './pages/EquipmentAvailability.jsx';
import DoctorPortal from './pages/DoctorPortal.jsx';
import AdminPortal from './pages/AdminPortal.jsx';
import NotificationBell from './components/NotificationBell.jsx';
import HospitalLogo from './components/HospitalLogo.jsx';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
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

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        width: '100%',
        background: '#F7FAFC',
        backgroundColor: '#F7FAFC',
        color: '#1A1A1A',
        fontFamily: 'Inter, sans-serif'
      }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  // Show appropriate portal based on role
  return (
    <div style={{ minHeight: '100vh', background: '#F7FAFC', backgroundColor: '#F7FAFC' }}>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <HospitalLogo size={36} />
            <span>Hospital Management System</span>
          </div>
          <div className="nav-links">
            {user?.role === 'patient' && (
              <>
                <NavLink className="nav-link" to="/patient-portal">Patient Portal</NavLink>
                <NotificationBell />
              </>
            )}
            {user?.role === 'doctor' && (
              <>
                <NavLink className="nav-link" to="/doctor-portal">Doctor Portal</NavLink>
                <NotificationBell />
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <NavLink className="nav-link" to="/admin-portal">Admin Portal</NavLink>
                <NavLink className="nav-link" to="/lab-upload">Lab Upload</NavLink>
                <NotificationBell />
              </>
            )}
            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{
                marginLeft: '0.75rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="content">
        <Routes>
          {/* Public/Login Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Patient Routes */}
          <Route
            path="/patient-portal"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientPortal />
              </ProtectedRoute>
            }
          />
          
          {/* Doctor Routes */}
          <Route
            path="/doctor-portal"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorPortal />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin-portal"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab-upload"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <LabUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <EquipmentAvailability />
              </ProtectedRoute>
            }
          />
          
          {/* Default redirect */}
          <Route
            path="/"
            element={
              user?.role === 'patient' ? <Navigate to="/patient-portal" replace /> :
              user?.role === 'doctor' ? <Navigate to="/doctor-portal" replace /> :
              user?.role === 'admin' ? <Navigate to="/admin-portal" replace /> :
              <Navigate to="/login" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
