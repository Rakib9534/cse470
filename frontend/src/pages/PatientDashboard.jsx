import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useControllers } from '../controllers/ControllerProvider.jsx';
import { reminderAPI } from '../services/api.js';

function PatientDashboard({ appointments, onRefresh }) {
  const { user } = useAuth();
  const { labResult: labResultController, appointment: appointmentController } = useControllers();
  const [emailFilter, setEmailFilter] = useState('');
  const [patientNameFilter, setPatientNameFilter] = useState('');
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' or 'labReports'
  const [labReports, setLabReports] = useState([]);
  const [filteredLabReports, setFilteredLabReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Remove auto-refresh on mount to prevent constant pulsing
  // Appointments are already loaded by parent component

  // Load lab reports using controller
  useEffect(() => {
    const loadLabReports = async () => {
      try {
        setLoading(true);
        const result = await labResultController.getAllLabResults({ email: user?.email });
        if (result.success) {
          const reports = result.labResults.map(report => report.toJSON());
          setLabReports(reports);
          setFilteredLabReports(reports);
        }
      } catch (error) {
        console.error('Error loading lab reports:', error);
        setLabReports([]);
        setFilteredLabReports([]);
      } finally {
        setLoading(false);
      }
    };
    loadLabReports();
  }, [user?.email, labResultController]);

  // Check for appointment reminders on load
  useEffect(() => {
    const checkReminders = async () => {
      try {
        // This will trigger the backend to check for upcoming appointments
        // and create reminder notifications if needed
        await reminderAPI.getUpcoming();
      } catch (error) {
        console.error('Error checking reminders:', error);
      }
    };
    if (user) {
      checkReminders();
    }
  }, [user]);

  // Filter lab reports based on email and name using controller
  useEffect(() => {
    if (emailFilter || patientNameFilter) {
      const filtered = labResultController.filterByEmailAndName(emailFilter, patientNameFilter);
      setFilteredLabReports(filtered.map(report => report.toJSON()));
    } else {
      setFilteredLabReports(labReports);
    }
  }, [emailFilter, patientNameFilter, labReports, labResultController]);

  // Filter and sort appointments
  const filtered = (emailFilter
    ? (appointments || []).filter((a) => (a.email || a.patientEmail) === emailFilter)
    : (appointments || [])
  ).sort((a, b) => {
    // Sort by date and time (upcoming first)
    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
    return dateA - dateB;
  });

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 className="card-title">Patient Dashboard</h1>
            <p className="card-subtitle">View and manage your appointments and lab reports</p>
          </div>
          {onRefresh && (
            <button
              onClick={async () => {
                if (refreshing) return; // Prevent multiple simultaneous refreshes
                setRefreshing(true);
                try {
                  await onRefresh();
                } catch (error) {
                  console.error('Error refreshing:', error);
                } finally {
                  // Add a small delay before resetting to ensure UI updates properly
                  setTimeout(() => {
                    setRefreshing(false);
                  }, 300);
                }
              }}
              disabled={refreshing}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                background: refreshing ? 'var(--text-tertiary)' : 'var(--primary-color)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                opacity: refreshing ? 0.7 : 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!refreshing) {
                  e.target.style.background = 'var(--primary-dark)';
                }
              }}
              onMouseLeave={(e) => {
                if (!refreshing) {
                  e.target.style.background = 'var(--primary-color)';
                }
              }}
            >
              <span>{refreshing ? '⏳' : '🔄'}</span>
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '0.5rem'
        }}>
          <button
            onClick={() => setActiveTab('appointments')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'appointments' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'appointments' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'appointments' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem'
            }}
          >
            My Appointments
          </button>
          <button
            onClick={() => setActiveTab('labReports')}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'transparent',
              color: activeTab === 'labReports' ? 'var(--primary-color)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'labReports' ? '600' : '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'labReports' ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s ease',
              fontSize: '0.9375rem'
            }}
          >
            Lab Reports
          </button>
        </div>

        {activeTab === 'appointments' ? (
          <>
            {appointments && appointments.length > 0 && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Total Appointments: </strong>
                {filtered.length} {filtered.length === 1 ? 'appointment' : 'appointments'}
              </div>
            )}
            {appointments && appointments.length > 1 && (
              <div className="filter-container" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">
                  Filter by Email Address (Optional)
                </label>
                <input
                  type="email"
                  className="filter-input"
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  placeholder="Enter email to filter appointments"
                />
              </div>
            )}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H17V12H7V10ZM7 14H17V16H7V14Z" fill="var(--text-light)"/>
            </svg>
          </div>
          <p className="empty-state-text">
            {emailFilter ? 'No appointments found for this email address.' : 'No appointments found. Book your first appointment to get started!'}
          </p>
        </div>
      ) : (
          <div style={{ marginTop: '2rem' }}>
            {filtered.map((appt) => {
              const appointmentId = appt.id || appt._id;
              const status = appt.status || 'confirmed';
              const statusColors = {
                pending: { bg: 'rgba(243, 156, 18, 0.1)', color: '#f39c12', text: 'Pending' },
                confirmed: { bg: 'rgba(22, 160, 133, 0.1)', color: '#16a085', text: 'Confirmed' },
                completed: { bg: 'rgba(52, 152, 219, 0.1)', color: '#3498db', text: 'Completed' },
                cancelled: { bg: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', text: 'Cancelled' }
              };
              const statusStyle = statusColors[status] || statusColors.confirmed;

              return (
                <div key={appointmentId} className="appointment-card" style={{
                  borderLeft: `3px solid ${statusStyle.color}`,
                  marginBottom: '1rem'
                }}>
                  <div className="appointment-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div className="appointment-doctor" style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem'
                      }}>
                        {appt.doctorName || 'Doctor Name'}
                      </div>
                      <div className="appointment-speciality" style={{
                        fontSize: '0.9375rem',
                        color: 'var(--primary-color)',
                        fontWeight: '500'
                      }}>
                        {appt.speciality || 'General Practitioner'}
                      </div>
                    </div>
                    <span style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.color}40`,
                      textTransform: 'uppercase'
                    }}>
                      {statusStyle.text}
                    </span>
                  </div>
                  <div className="appointment-details" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                  }}>
                    <div className="appointment-detail">
                      <span className="appointment-detail-label" style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                      }}>📅 Appointment Date</span>
                      <span className="appointment-detail-value" style={{
                        fontSize: '0.9375rem',
                        color: 'var(--text-primary)',
                        fontWeight: '600'
                      }}>
                        {appt.date ? new Date(appt.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'Not set'}
                      </span>
                    </div>
                    <div className="appointment-detail">
                      <span className="appointment-detail-label" style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                      }}>🕐 Appointment Time</span>
                      <span className="appointment-detail-value" style={{
                        fontSize: '0.9375rem',
                        color: 'var(--text-primary)',
                        fontWeight: '600'
                      }}>
                        {appt.time || 'Not set'}
                      </span>
                    </div>
                    <div className="appointment-detail">
                      <span className="appointment-detail-label" style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                      }}>👤 Patient Name</span>
                      <span className="appointment-detail-value" style={{
                        fontSize: '0.9375rem',
                        color: 'var(--text-primary)',
                        fontWeight: '600'
                      }}>
                        {appt.patientName || 'Not set'}
                      </span>
                    </div>
                    {(appt.email || appt.patientEmail) && (
                      <div className="appointment-detail">
                        <span className="appointment-detail-label" style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          fontWeight: '500',
                          marginBottom: '0.25rem'
                        }}>📧 Email</span>
                        <span className="appointment-detail-value" style={{
                          fontSize: '0.9375rem',
                          color: 'var(--text-primary)'
                        }}>
                          {appt.email || appt.patientEmail}
                        </span>
                      </div>
                    )}
                    {appt.phone && (
                      <div className="appointment-detail">
                        <span className="appointment-detail-label" style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          fontWeight: '500',
                          marginBottom: '0.25rem'
                        }}>📞 Phone</span>
                        <span className="appointment-detail-value" style={{
                          fontSize: '0.9375rem',
                          color: 'var(--text-primary)'
                        }}>
                          {appt.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Patient Email or ID
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  placeholder="Enter your email or patient ID"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Patient Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={patientNameFilter}
                  onChange={(e) => setPatientNameFilter(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {filteredLabReports.length === 0 ? (
              <div className="empty-state">
                <div style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 1rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 15H16V17H8V15ZM8 11H16V13H8V11Z" fill="var(--text-light)"/>
                  </svg>
                </div>
                <p className="empty-state-text">
                  {emailFilter || patientNameFilter 
                    ? 'No lab reports found. Please check your email/ID and name, or contact the lab if you believe there should be reports available.' 
                    : 'Enter your email/ID and name to view your lab reports.'}
                </p>
              </div>
            ) : (
              <div style={{ marginTop: '2rem' }}>
                {filteredLabReports.map((report) => (
                  <div key={report.id} className="appointment-card" style={{ borderLeftColor: 'var(--warning-color)' }}>
                    <div className="appointment-header">
                      <div>
                        <div className="appointment-doctor">Lab Report - {report.testType}</div>
                        <div className="appointment-speciality" style={{ color: 'var(--warning-color)' }}>
                          Patient ID: {report.patientId}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--warning-color)',
                        color: 'white',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {report.testType}
                      </div>
                    </div>
                    <div className="appointment-details">
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">Test Date</span>
                        <span className="appointment-detail-value">{report.testDate}</span>
                      </div>
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">Upload Date</span>
                        <span className="appointment-detail-value">{report.uploadDate}</span>
                      </div>
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">File Name</span>
                        <span className="appointment-detail-value">{report.fileName}</span>
                      </div>
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">Lab Technician</span>
                        <span className="appointment-detail-value">{report.technicianName}</span>
                      </div>
                      {report.patientName && (
                        <div className="appointment-detail">
                          <span className="appointment-detail-label">Patient Name</span>
                          <span className="appointment-detail-value">{report.patientName}</span>
                        </div>
                      )}
                      {report.patientEmail && (
                        <div className="appointment-detail">
                          <span className="appointment-detail-label">Email</span>
                          <span className="appointment-detail-value">{report.patientEmail}</span>
                        </div>
                      )}
                      {report.notes && (
                        <div className="appointment-detail" style={{ gridColumn: '1 / -1' }}>
                          <span className="appointment-detail-label">Notes</span>
                          <span className="appointment-detail-value" style={{ 
                            padding: '0.75rem',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            marginTop: '0.5rem'
                          }}>
                            {report.notes}
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px dashed var(--border-color)',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.25rem'
                      }}>
                        Report File: <strong>{report.fileName}</strong>
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)'
                      }}>
                        Contact the lab or your doctor to access the full report file
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;