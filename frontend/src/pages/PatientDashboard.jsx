import { useState, useEffect } from 'react';

function PatientDashboard({ appointments }) {
  const [emailFilter, setEmailFilter] = useState('');
  const [patientNameFilter, setPatientNameFilter] = useState('');
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' or 'labReports'
  const [labReports, setLabReports] = useState([]);
  const [filteredLabReports, setFilteredLabReports] = useState([]);

  // Load lab reports from localStorage
  useEffect(() => {
    const loadLabReports = () => {
      const saved = localStorage.getItem('labResults');
      if (saved) {
        const reports = JSON.parse(saved);
        setLabReports(reports);
        setFilteredLabReports(reports);
      }
    };
    loadLabReports();
  }, []);

  // Filter lab reports based on email and name
  useEffect(() => {
    if (emailFilter || patientNameFilter) {
      const filtered = labReports.filter((report) => {
        const emailMatch = !emailFilter || 
          (report.patientEmail && report.patientEmail.toLowerCase().includes(emailFilter.toLowerCase()));
        const nameMatch = !patientNameFilter || 
          (report.patientName && report.patientName.toLowerCase().includes(patientNameFilter.toLowerCase()));
        const idMatch = !emailFilter || report.patientId.toLowerCase().includes(emailFilter.toLowerCase());
        
        return (emailMatch || idMatch) && nameMatch;
      });
      setFilteredLabReports(filtered);
    } else {
      setFilteredLabReports(labReports);
    }
  }, [emailFilter, patientNameFilter, labReports]);

  const filtered = emailFilter
    ? appointments.filter((a) => a.email === emailFilter)
    : appointments;

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Patient Dashboard</h1>
          <p className="card-subtitle">View and manage your appointments and lab reports</p>
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
            <div className="filter-container">
              <label className="form-label">
                Filter by Email Address
              </label>
              <input
                type="email"
                className="filter-input"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                placeholder="Enter your email to filter appointments"
              />
            </div>

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
            {filtered.map((appt) => (
              <div key={appt.id} className="appointment-card">
                <div className="appointment-header">
                  <div>
                    <div className="appointment-doctor">{appt.doctorName}</div>
                    <div className="appointment-speciality">{appt.speciality}</div>
                  </div>
                </div>
                <div className="appointment-details">
                  <div className="appointment-detail">
                    <span className="appointment-detail-label">Date</span>
                    <span className="appointment-detail-value">{appt.date}</span>
                  </div>
                  <div className="appointment-detail">
                    <span className="appointment-detail-label">Time</span>
                    <span className="appointment-detail-value">{appt.time}</span>
                  </div>
                  <div className="appointment-detail">
                    <span className="appointment-detail-label">Patient Name</span>
                    <span className="appointment-detail-value">{appt.patientName}</span>
                  </div>
                  <div className="appointment-detail">
                    <span className="appointment-detail-label">Email</span>
                    <span className="appointment-detail-value">{appt.email}</span>
                  </div>
                  {appt.phone && (
                    <div className="appointment-detail">
                      <span className="appointment-detail-label">Phone</span>
                      <span className="appointment-detail-value">{appt.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
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