import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useControllers } from '../controllers/ControllerProvider.jsx';
import { doctorAPI } from '../services/api.js';
import { useLocation } from 'react-router-dom';
import Home from './Home.jsx';
import Doctors from './Doctors.jsx';
import BookAppointment from './BookAppointment.jsx';
import PatientDashboard from './PatientDashboard.jsx';
import MedicalHistory from './patient/MedicalHistory.jsx';
import ProfileSettings from './patient/ProfileSettings.jsx';
import DocumentUpload from './patient/DocumentUpload.jsx';
import MyBills from './patient/MyBills.jsx';
import EquipmentAvailability from './EquipmentAvailability.jsx';

function PatientPortal() {
  const { user } = useAuth();
  const { appointment: appointmentController } = useControllers();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    // Check if navigation state contains activeTab
    return location.state?.activeTab || 'home';
  });
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  // Handle navigation state changes
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state to prevent re-triggering on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch appointments using controller
  useEffect(() => {
    if (user?.email) {
      fetchAppointments();
    }
  }, [user?.email]);

  // Fetch doctors from API
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const result = await appointmentController.getAllAppointments({ email: user.email });
      if (result.success) {
        // Convert models to plain objects for compatibility
        setAppointments(result.appointments.map(apt => apt.toJSON()));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setDoctorsLoading(true);
      setDoctors([]);
      const result = await doctorAPI.getAll();
      if (result.success) {
        // Convert doctor data to format expected by components
        const formattedDoctors = result.data.map(doctor => ({
          id: doctor._id || doctor.id,
          name: doctor.name,
          speciality: doctor.speciality || 'General Practitioner',
          slots: [] // Slots will be fetched dynamically
        }));
        setDoctors(formattedDoctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  const handleCreateAppointment = async (appointmentData) => {
    // Create appointment using controller
    const result = await appointmentController.createAppointment(appointmentData);
    if (result.success) {
      // Refresh appointments
      await fetchAppointments();
    }
    return result;
  };

  // Appointments are already filtered by email from localStorage
  const patientAppointments = appointments;

  return (
    <div>
      {/* Patient Portal Header */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="card-title" style={{ marginBottom: '0.5rem' }}>Patient Portal</h1>
            <p className="card-subtitle" style={{ margin: 0 }}>
              Welcome, {user?.name || 'Patient'}
            </p>
          </div>
          <div style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--secondary-light)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--secondary-color)',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>
            {user?.email}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card" style={{ padding: '0', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          gap: '0',
          borderBottom: '1px solid var(--border-light)',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'home' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'home' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'home' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              whiteSpace: 'nowrap'
            }}
          >
            🏠 Home
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'doctors' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'doctors' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'doctors' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              whiteSpace: 'nowrap'
            }}
          >
            👨‍⚕️ View Doctors & Slots
          </button>
          <button
            onClick={() => setActiveTab('book')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'book' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'book' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'book' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              whiteSpace: 'nowrap'
            }}
          >
            📅 Book Appointment
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'dashboard' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'dashboard' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'dashboard' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              whiteSpace: 'nowrap'
            }}
          >
            📊 My Dashboard
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'history' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'history' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'history' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              whiteSpace: 'nowrap'
            }}
          >
            🏥 Medical History
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'profile' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'profile' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'profile' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              whiteSpace: 'nowrap'
            }}
          >
            ⚙️ Profile Settings
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'bills' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'bills' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'bills' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              whiteSpace: 'nowrap'
            }}
          >
            💰 My Bills
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'equipment' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'equipment' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'equipment' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              whiteSpace: 'nowrap'
            }}
          >
            🔧 Equipment
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'documents' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'documents' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'documents' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              whiteSpace: 'nowrap'
            }}
          >
            📄 My Documents
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'home' && <Home onNavigate={setActiveTab} />}
        {activeTab === 'doctors' && <Doctors doctors={doctors} />}
        {activeTab === 'book' && (
          <BookAppointment
            doctors={doctors}
            onCreateAppointment={handleCreateAppointment}
            defaultEmail={user?.email || ''}
            defaultName={user?.name || ''}
          />
        )}
        {activeTab === 'dashboard' && (
          <PatientDashboard 
            appointments={patientAppointments} 
            onRefresh={fetchAppointments}
          />
        )}
        {activeTab === 'history' && <MedicalHistory />}
        {activeTab === 'bills' && <MyBills />}
        {activeTab === 'equipment' && <EquipmentAvailability />}
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'documents' && <DocumentUpload />}
      </div>
    </div>
  );
}

export default PatientPortal;

