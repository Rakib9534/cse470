import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function Home({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const handleNavigate = (target) => {
    if (onNavigate) {
      // If we're inside PatientPortal, use the callback to change tabs
      onNavigate(target);
    } else {
      // If we're on a standalone page, navigate to the appropriate portal
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      // Route based on user role and target
      switch (target) {
        case 'lab-upload':
          if (user?.role === 'admin') {
            navigate('/lab-upload');
          } else {
            // For non-admins, show a message or redirect
            navigate('/patient-portal');
          }
          break;
        
        case 'doctors':
        case 'book':
        case 'dashboard':
          if (user?.role === 'patient') {
            navigate('/patient-portal', { state: { activeTab: target } });
          } else {
            // Doctors can also use patient portal features
            navigate('/patient-portal', { state: { activeTab: target } });
          }
          break;
        
        default:
          // Default fallback
          if (user?.role === 'patient') {
            navigate('/patient-portal');
          } else if (user?.role === 'admin') {
            navigate('/admin-portal');
          } else if (user?.role === 'doctor') {
            navigate('/doctor-portal');
          }
      }
    }
  };
  return (
    <div className="page-container">
      <div className="hero-section">
        <h1 className="hero-title">Hospital Appointment System</h1>
        <p className="hero-subtitle">
          Book doctor appointments online, view available slots, and track your bookings from
          your dashboard. Experience seamless healthcare management at your fingertips.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
        <div className="card" style={{ borderLeft: '3px solid var(--primary-color)', background: 'linear-gradient(to right, rgba(11, 83, 148, 0.02) 0%, var(--bg-primary) 10%)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="card-header" style={{ flex: '0 0 auto' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: 'var(--radius-lg)', 
              background: 'linear-gradient(135deg, var(--primary-lighter) 0%, rgba(11, 83, 148, 0.15) 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '1rem',
              border: '1px solid rgba(11, 83, 148, 0.1)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V3H13V9H21ZM14 10V12H16V10H14ZM18 10V12H20V10H18ZM14 14V16H16V14H14ZM18 14V16H20V14H18ZM14 18V20H16V18H14ZM18 18V20H20V18H18Z" fill="var(--primary-color)"/>
              </svg>
            </div>
            <h2 className="card-title">Find Doctors</h2>
            <p className="card-subtitle">Browse our expert medical professionals</p>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6', flex: '1 1 auto' }}>
            View available doctors and their specializations. Check real-time availability and find the perfect match for your healthcare needs.
          </p>
          <button 
            onClick={() => handleNavigate('doctors')} 
            className="btn btn-primary" 
            style={{ width: '100%', textAlign: 'center', justifyContent: 'center', display: 'inline-flex', marginTop: 'auto' }}
          >
            View Doctors
          </button>
        </div>

        <div className="card" style={{ borderLeft: '3px solid var(--secondary-color)', background: 'linear-gradient(to right, rgba(22, 160, 133, 0.02) 0%, var(--bg-primary) 10%)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="card-header" style={{ flex: '0 0 auto' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: 'var(--radius-lg)', 
              background: 'linear-gradient(135deg, var(--secondary-light) 0%, rgba(22, 160, 133, 0.15) 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '1rem',
              border: '1px solid rgba(22, 160, 133, 0.1)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H9V12H7V10ZM11 10H13V12H11V10ZM15 10H17V12H15V10ZM7 14H9V16H7V14ZM11 14H13V16H11V14ZM15 14H17V16H15V14Z" fill="var(--secondary-color)"/>
              </svg>
            </div>
            <h2 className="card-title">Book Appointments</h2>
            <p className="card-subtitle">Schedule your visit in minutes</p>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6', flex: '1 1 auto' }}>
            Select your preferred doctor, choose a convenient date and time slot, and confirm your appointment with just a few clicks.
          </p>
          <button 
            onClick={() => handleNavigate('book')} 
            className="btn btn-primary" 
            style={{ width: '100%', textAlign: 'center', justifyContent: 'center', display: 'inline-flex', marginTop: 'auto' }}
          >
            Book Appointment
          </button>
        </div>

        <div className="card" style={{ borderLeft: '3px solid var(--info-color)', background: 'linear-gradient(to right, rgba(52, 152, 219, 0.02) 0%, var(--bg-primary) 10%)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="card-header" style={{ flex: '0 0 auto' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: 'var(--radius-lg)', 
              background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.15) 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '1rem',
              border: '1px solid rgba(52, 152, 219, 0.1)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H17V12H7V10ZM7 14H17V16H7V14Z" fill="var(--info-color)"/>
              </svg>
            </div>
            <h2 className="card-title">Manage Bookings</h2>
            <p className="card-subtitle">Track all your appointments</p>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6', flex: '1 1 auto' }}>
            Access your personal dashboard to view, manage, and keep track of all your confirmed appointments in one place.
          </p>
          <button 
            onClick={() => handleNavigate('dashboard')} 
            className="btn btn-primary" 
            style={{ width: '100%', textAlign: 'center', justifyContent: 'center', display: 'inline-flex', marginTop: 'auto' }}
          >
            View Dashboard
          </button>
        </div>

        <div className="card" style={{ borderLeft: '3px solid var(--warning-color)', background: 'linear-gradient(to right, rgba(243, 156, 18, 0.02) 0%, var(--bg-primary) 10%)', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="card-header" style={{ flex: '0 0 auto' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: 'var(--radius-lg)', 
              background: 'linear-gradient(135deg, rgba(243, 156, 18, 0.1) 0%, rgba(243, 156, 18, 0.15) 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '1rem',
              border: '1px solid rgba(243, 156, 18, 0.1)'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 15H16V17H8V15ZM8 11H16V13H8V11Z" fill="var(--warning-color)"/>
              </svg>
            </div>
            <h2 className="card-title">Lab Upload</h2>
            <p className="card-subtitle">Upload patient lab results</p>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6', flex: '1 1 auto' }}>
            Lab technicians can upload test results and reports for patients. Access the lab portal to manage all laboratory documents.
          </p>
          <button 
            onClick={() => handleNavigate('lab-upload')} 
            className="btn btn-primary" 
            style={{ width: '100%', textAlign: 'center', justifyContent: 'center', display: 'inline-flex', marginTop: 'auto' }}
          >
            Go to Lab Upload
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;