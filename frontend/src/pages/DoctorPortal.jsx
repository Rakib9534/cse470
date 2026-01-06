import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import TimeSlotManagement from './doctor/TimeSlotManagement.jsx';
import ScheduleView from './doctor/ScheduleView.jsx';
import PatientRecords from './doctor/PatientRecords.jsx';
import TreatmentNotes from './doctor/TreatmentNotes.jsx';

function DoctorPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');

  // Use logged-in doctor profile; fall back to a generic profile if missing
  const doctorProfile = {
    id: user?.id || 'doctor-placeholder',
    name: user?.name || 'Doctor',
    speciality: user?.speciality || 'Doctor',
    email: user?.email || 'not.set@hospital.com',
    phone: user?.phone || ''
  };

  return (
    <div className="page-container">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="card-title" style={{ marginBottom: '0.5rem' }}>Doctor Portal</h1>
            <p className="card-subtitle" style={{ margin: 0 }}>
              Welcome, {doctorProfile.name} • {doctorProfile.speciality}
            </p>
          </div>
          <div style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--primary-lighter)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--primary-color)',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>
            {doctorProfile.email}
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
            onClick={() => setActiveTab('schedule')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'schedule' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'schedule' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'schedule' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              whiteSpace: 'nowrap'
            }}
          >
            📅 Schedule
          </button>
          <button
            onClick={() => setActiveTab('timeSlots')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'timeSlots' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'timeSlots' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'timeSlots' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              whiteSpace: 'nowrap'
            }}
          >
            ⏰ Manage Slots
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'patients' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'patients' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'patients' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              whiteSpace: 'nowrap'
            }}
          >
            👥 Patient Records
          </button>
          <button
            onClick={() => setActiveTab('treatment')}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'treatment' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'treatment' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'treatment' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem',
              whiteSpace: 'nowrap'
            }}
          >
            💊 Treatment Notes
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'schedule' && <ScheduleView doctorId={doctorProfile.id} />}
        {activeTab === 'timeSlots' && <TimeSlotManagement doctorId={doctorProfile.id} />}
        {activeTab === 'patients' && <PatientRecords doctorId={doctorProfile.id} />}
        {activeTab === 'treatment' && <TreatmentNotes doctorId={doctorProfile.id} />}
      </div>
    </div>
  );
}

export default DoctorPortal;

