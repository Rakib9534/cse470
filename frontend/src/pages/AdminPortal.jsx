import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { doctorAPI } from '../services/api.js';
import AccountManagement from './admin/AccountManagement.jsx';
import StaffTracking from './admin/StaffTracking.jsx';
import BillingSystem from './admin/BillingSystem.jsx';
import SystemNotifications from './admin/SystemNotifications.jsx';

function AdminPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [equipmentBookings, setEquipmentBookings] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalDoctors: 0,
    totalLabResults: 0,
    totalEquipmentBookings: 0
  });

  // Fetch doctors from database
  const fetchDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const result = await doctorAPI.getAll();
      if (result.success && result.data) {
        // Format doctors data to match the expected structure
        const formattedDoctors = result.data.map(doctor => ({
          id: doctor._id || doctor.id,
          name: doctor.name,
          speciality: doctor.speciality || 'General Practitioner',
          email: doctor.email,
          phone: doctor.phone || 'N/A',
          department: doctor.department || 'N/A',
          licenseNumber: doctor.licenseNumber || 'N/A'
        }));
        setDoctors(formattedDoctors);
        // Update stats with real doctor count
        setStats(prevStats => ({
          ...prevStats,
          totalDoctors: formattedDoctors.length
        }));
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  useEffect(() => {
    // Load all data
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }

    const savedLabResults = localStorage.getItem('labResults');
    if (savedLabResults) {
      setLabResults(JSON.parse(savedLabResults));
    }

    // Parse equipment bookings from nested structure
    const savedEquipmentBookings = localStorage.getItem('equipmentBookings');
    if (savedEquipmentBookings) {
      const bookingsData = JSON.parse(savedEquipmentBookings);
      // Flatten the nested structure
      const flattenedBookings = [];
      Object.keys(bookingsData).forEach(date => {
        Object.keys(bookingsData[date]).forEach(equipmentId => {
          bookingsData[date][equipmentId].forEach(booking => {
            flattenedBookings.push({
              ...booking,
              equipmentName: equipmentId
            });
          });
        });
      });
      setEquipmentBookings(flattenedBookings);
    }

    // Fetch doctors from database
    fetchDoctors();

    // Calculate stats
    const savedEquipmentBookingsForStats = localStorage.getItem('equipmentBookings');
    let totalEquipmentBookings = 0;
    if (savedEquipmentBookingsForStats) {
      const bookingsData = JSON.parse(savedEquipmentBookingsForStats);
      Object.keys(bookingsData).forEach(date => {
        Object.keys(bookingsData[date]).forEach(equipmentId => {
          totalEquipmentBookings += bookingsData[date][equipmentId].length;
        });
      });
    }

    setStats(prevStats => ({
      ...prevStats,
      totalAppointments: savedAppointments ? JSON.parse(savedAppointments).length : 0,
      totalLabResults: savedLabResults ? JSON.parse(savedLabResults).length : 0,
      totalEquipmentBookings: totalEquipmentBookings
    }));
  }, []);

  return (
    <div className="page-container">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="card-title" style={{ marginBottom: '0.5rem' }}>Admin Portal</h1>
            <p className="card-subtitle" style={{ margin: 0 }}>
              Welcome, {user?.name} • System Administration
            </p>
          </div>
          <div style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--accent-light)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-color)',
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
          {['overview', 'accounts', 'staff', 'billing', 'notifications', 'appointments', 'doctors', 'labResults', 'equipment'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                background: 'transparent',
                color: activeTab === tab ? 'var(--primary-color)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? '600' : '500',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
                transition: 'all 0.2s ease',
                fontSize: '0.9375rem',
                whiteSpace: 'nowrap',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'accounts' && '👥 Accounts'}
              {tab === 'staff' && '📋 Staff Tracking'}
              {tab === 'billing' && '💰 Billing'}
              {tab === 'notifications' && '🔔 Notifications'}
              {tab === 'appointments' && '📅 Appointments'}
              {tab === 'doctors' && '👨‍⚕️ Doctors'}
              {tab === 'labResults' && '🧪 Lab Results'}
              {tab === 'equipment' && '🔧 Equipment'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'accounts' && <AccountManagement />}
        {activeTab === 'staff' && <StaffTracking />}
        {activeTab === 'billing' && <BillingSystem />}
        {activeTab === 'notifications' && <SystemNotifications />}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="card" style={{ borderLeft: '3px solid var(--primary-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Total Appointments
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                      {stats.totalAppointments}
                    </div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--primary-lighter)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    📅
                  </div>
                </div>
              </div>

              <div className="card" style={{ borderLeft: '3px solid var(--secondary-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Active Doctors
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--secondary-color)' }}>
                      {stats.totalDoctors}
                    </div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--secondary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    👨‍⚕️
                  </div>
                </div>
              </div>

              <div className="card" style={{ borderLeft: '3px solid var(--warning-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Lab Results
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--warning-color)' }}>
                      {stats.totalLabResults}
                    </div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(243, 156, 18, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    🧪
                  </div>
                </div>
              </div>

              <div className="card" style={{ borderLeft: '3px solid var(--info-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Equipment Bookings
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--info-color)' }}>
                      {stats.totalEquipmentBookings}
                    </div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(52, 152, 219, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    🔧
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Recent Activity</h2>
              </div>
              <div>
                {appointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="appointment-card" style={{ borderLeftColor: 'var(--primary-color)', marginBottom: '1rem' }}>
                    <div className="appointment-header">
                      <div>
                        <div className="appointment-doctor">{apt.patientName}</div>
                        <div className="appointment-speciality">Appointment with {apt.doctorName}</div>
                      </div>
                    </div>
                    <div className="appointment-details">
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">Date</span>
                        <span className="appointment-detail-value">{apt.date}</span>
                      </div>
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">Time</span>
                        <span className="appointment-detail-value">{apt.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div className="empty-state">
                    <p className="empty-state-text">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">All Appointments</h2>
              <p className="card-subtitle">Manage and view all system appointments</p>
            </div>
            {appointments.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">No appointments found</p>
              </div>
            ) : (
              <div style={{ marginTop: '2rem' }}>
                {appointments.map((apt) => (
                  <div key={apt.id} className="appointment-card" style={{ borderLeftColor: 'var(--primary-color)' }}>
                    <div className="appointment-header">
                      <div>
                        <div className="appointment-doctor">{apt.patientName}</div>
                        <div className="appointment-speciality">{apt.doctorName} • {apt.speciality}</div>
                      </div>
                    </div>
                    <div className="appointment-details">
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">Date</span>
                        <span className="appointment-detail-value">{apt.date}</span>
                      </div>
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">Time</span>
                        <span className="appointment-detail-value">{apt.time}</span>
                      </div>
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">Email</span>
                        <span className="appointment-detail-value">{apt.email}</span>
                      </div>
                      {apt.phone && (
                        <div className="appointment-detail">
                          <span className="appointment-detail-label">Phone</span>
                          <span className="appointment-detail-value">{apt.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Doctors Management</h2>
              <p className="card-subtitle">View and manage all doctors from database</p>
            </div>
            {doctorsLoading ? (
              <div className="empty-state" style={{ marginTop: '2rem' }}>
                <p className="empty-state-text">Loading doctors...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="empty-state" style={{ marginTop: '2rem' }}>
                <p className="empty-state-text">No doctors found in the database</p>
              </div>
            ) : (
              <div style={{ marginTop: '2rem' }}>
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="doctor-card" style={{
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-primary)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: '1' }}>
                        <div className="doctor-name" style={{
                          fontSize: '1.125rem',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          marginBottom: '0.5rem'
                        }}>
                          {doctor.name}
                        </div>
                        <div className="doctor-speciality" style={{
                          fontSize: '0.9375rem',
                          color: 'var(--primary-color)',
                          fontWeight: '500',
                          marginBottom: '0.75rem'
                        }}>
                          {doctor.speciality}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                          <div>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Email: </span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{doctor.email}</span>
                          </div>
                          {doctor.phone && (
                            <div>
                              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Phone: </span>
                              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{doctor.phone}</span>
                            </div>
                          )}
                          {doctor.department && doctor.department !== 'N/A' && (
                            <div>
                              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Department: </span>
                              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{doctor.department}</span>
                            </div>
                          )}
                          {doctor.licenseNumber && doctor.licenseNumber !== 'N/A' && (
                            <div>
                              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>License: </span>
                              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{doctor.licenseNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'labResults' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Lab Results</h2>
              <p className="card-subtitle">View all lab test results</p>
            </div>
            {labResults.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">No lab results found</p>
              </div>
            ) : (
              <div style={{ marginTop: '2rem' }}>
                {labResults.map((lab) => (
                  <div key={lab.id} className="appointment-card" style={{ borderLeftColor: 'var(--warning-color)' }}>
                    <div className="appointment-header">
                      <div>
                        <div className="appointment-doctor">Patient ID: {lab.patientId}</div>
                        <div className="appointment-speciality" style={{ color: 'var(--warning-color)' }}>
                          {lab.testType}
                        </div>
                      </div>
                    </div>
                    <div className="appointment-details">
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">Test Date</span>
                        <span className="appointment-detail-value">{lab.testDate}</span>
                      </div>
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">File</span>
                        <span className="appointment-detail-value">{lab.fileName}</span>
                      </div>
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">Technician</span>
                        <span className="appointment-detail-value">{lab.technicianName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Equipment Bookings</h2>
              <p className="card-subtitle">View all equipment reservations</p>
            </div>
            {equipmentBookings.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-text">No equipment bookings found</p>
              </div>
            ) : (
              <div style={{ marginTop: '2rem' }}>
                {equipmentBookings.map((booking) => (
                  <div key={booking.id} className="appointment-card" style={{ borderLeftColor: 'var(--info-color)' }}>
                    <div className="appointment-header">
                      <div>
                        <div className="appointment-doctor">{booking.equipmentName}</div>
                        <div className="appointment-speciality" style={{ color: 'var(--info-color)' }}>
                          {booking.date} at {booking.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPortal;

