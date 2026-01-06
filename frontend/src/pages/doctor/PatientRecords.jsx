import { useState, useEffect } from 'react';
import { useControllers } from '../../controllers/ControllerProvider.jsx';

function PatientRecords({ doctorId }) {
  const { appointment: appointmentController, labResult: labResultController, treatment: treatmentController } = useControllers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all data from backend API
  useEffect(() => {
    const loadData = async () => {
      if (!doctorId || doctorId === 'doctor-placeholder') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load appointments for this doctor
        const appointmentsResult = await appointmentController.getAllAppointments({ doctorId });
        if (appointmentsResult.success) {
          setAppointments(appointmentsResult.appointments.map(apt => apt.toJSON()));
        }

        // Load all lab results (doctor can see all)
        const labResultsResult = await labResultController.getAllLabResults();
        if (labResultsResult.success) {
          setLabResults(labResultsResult.labResults.map(lab => lab.toJSON()));
        }

        // Load all treatments (doctor can see all)
        const treatmentsResult = await treatmentController.getAllTreatments();
        if (treatmentsResult.success) {
          setTreatmentHistory(treatmentsResult.treatments.map(t => t.toJSON()));
        }
      } catch (error) {
        console.error('Error loading patient records:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [doctorId, appointmentController, labResultController, treatmentController]);

  // Get unique patients from appointments
  const getUniquePatients = () => {
    const patientsMap = new Map();
    appointments.forEach(apt => {
      if (!patientsMap.has(apt.email)) {
        patientsMap.set(apt.email, {
          email: apt.email,
          name: apt.patientName,
          phone: apt.phone,
          lastAppointment: apt.date,
          appointmentCount: 1
        });
      } else {
        const patient = patientsMap.get(apt.email);
        patient.appointmentCount += 1;
        if (new Date(apt.date) > new Date(patient.lastAppointment)) {
          patient.lastAppointment = apt.date;
        }
      }
    });
    return Array.from(patientsMap.values());
  };

  const patients = getUniquePatients();
  
  const filteredPatients = searchTerm
    ? patients.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : patients;

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    
    // Get patient's appointments
    const patientAppointments = appointments.filter(apt => apt.email === patient.email);
    
    // Get patient's lab results
    const patientLabResults = labResults.filter(lab => 
      lab.patientEmail === patient.email || lab.patientId === patient.email
    );
    
    // Get patient's treatment history
    const patientTreatments = treatmentHistory.filter(t => t.patientEmail === patient.email);
    
    setSelectedPatient({
      ...patient,
      appointments: patientAppointments,
      labResults: patientLabResults,
      treatments: patientTreatments
    });
  };

  return (
    <div>
      {!selectedPatient ? (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Patient Records</h2>
            <p className="card-subtitle">Search and access patient information before consultations</p>
          </div>

          <div className="filter-container">
            <label className="form-label">
              Search Patients
            </label>
            <input
              type="text"
              className="filter-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
            />
          </div>

          {loading ? (
            <div className="empty-state">
              <p className="empty-state-text">Loading patient records...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">
                {searchTerm ? 'No patients found matching your search.' : 'No patients found. Patients will appear here after booking appointments.'}
              </p>
            </div>
          ) : (
            <div style={{ marginTop: '2rem' }}>
              {filteredPatients.map((patient) => (
                <div
                  key={patient.email}
                  className="appointment-card"
                  style={{
                    cursor: 'pointer',
                    borderLeftColor: 'var(--info-color)'
                  }}
                  onClick={() => handleSelectPatient(patient)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div className="appointment-header">
                    <div>
                      <div className="appointment-doctor">{patient.name}</div>
                      <div className="appointment-speciality" style={{ color: 'var(--info-color)' }}>
                        {patient.email}
                      </div>
                    </div>
                    <div style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--primary-lighter)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--primary-color)'
                    }}>
                      {patient.appointmentCount} {patient.appointmentCount === 1 ? 'Visit' : 'Visits'}
                    </div>
                  </div>
                  <div className="appointment-details">
                    <div className="appointment-detail">
                      <span className="appointment-detail-label">Last Visit</span>
                      <span className="appointment-detail-value">{new Date(patient.lastAppointment).toLocaleDateString()}</span>
                    </div>
                    {patient.phone && (
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">Phone</span>
                        <span className="appointment-detail-value">{patient.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Back Button */}
          <button
            onClick={() => setSelectedPatient(null)}
            className="btn btn-secondary"
            style={{ marginBottom: '1.5rem' }}
          >
            ← Back to Patient List
          </button>

          {/* Patient Overview */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <h2 className="card-title">{selectedPatient.name}</h2>
              <p className="card-subtitle">Patient Medical Records</p>
            </div>
            <div className="appointment-details">
              <div className="appointment-detail">
                <span className="appointment-detail-label">Email</span>
                <span className="appointment-detail-value">{selectedPatient.email}</span>
              </div>
              {selectedPatient.phone && (
                <div className="appointment-detail">
                  <span className="appointment-detail-label">Phone</span>
                  <span className="appointment-detail-value">{selectedPatient.phone}</span>
                </div>
              )}
              <div className="appointment-detail">
                <span className="appointment-detail-label">Total Appointments</span>
                <span className="appointment-detail-value">{selectedPatient.appointments?.length || 0}</span>
              </div>
              <div className="appointment-detail">
                <span className="appointment-detail-label">Lab Results</span>
                <span className="appointment-detail-value">{selectedPatient.labResults?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Appointment History */}
          {selectedPatient.appointments && selectedPatient.appointments.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: '1.25rem' }}>Appointment History</h3>
              </div>
              <div>
                {selectedPatient.appointments.map((apt) => (
                  <div key={apt.id} className="appointment-card" style={{ borderLeftColor: 'var(--secondary-color)', marginBottom: '1rem' }}>
                    <div className="appointment-header">
                      <div>
                        <div className="appointment-doctor">Appointment on {new Date(apt.date).toLocaleDateString()}</div>
                        <div className="appointment-speciality">Time: {apt.time}</div>
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
              </div>
            </div>
          )}

          {/* Lab Results */}
          {selectedPatient.labResults && selectedPatient.labResults.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: '1.25rem' }}>Lab Results</h3>
              </div>
              <div>
                {selectedPatient.labResults.map((lab) => (
                  <div key={lab.id} className="appointment-card" style={{ borderLeftColor: 'var(--warning-color)', marginBottom: '1rem' }}>
                    <div className="appointment-header">
                      <div>
                        <div className="appointment-doctor">{lab.testType}</div>
                        <div className="appointment-speciality" style={{ color: 'var(--warning-color)' }}>
                          Test Date: {lab.testDate}
                        </div>
                      </div>
                    </div>
                    <div className="appointment-details">
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">Test Type</span>
                        <span className="appointment-detail-value">{lab.testType}</span>
                      </div>
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">Test Date</span>
                        <span className="appointment-detail-value">{lab.testDate}</span>
                      </div>
                      <div className="appointment-detail">
                        <span className="appointment-detail-label">File</span>
                        <span className="appointment-detail-value">{lab.fileName}</span>
                      </div>
                      {lab.notes && (
                        <div className="appointment-detail" style={{ gridColumn: '1 / -1' }}>
                          <span className="appointment-detail-label">Notes</span>
                          <span className="appointment-detail-value">{lab.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Treatment History */}
          {selectedPatient.treatments && selectedPatient.treatments.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: '1.25rem' }}>Treatment History</h3>
              </div>
              <div>
                {selectedPatient.treatments.map((treatment) => (
                  <div key={treatment.id} className="appointment-card" style={{ borderLeftColor: 'var(--success-color)', marginBottom: '1rem' }}>
                    <div className="appointment-header">
                      <div>
                        <div className="appointment-doctor">Treatment on {new Date(treatment.date).toLocaleDateString()}</div>
                        <div className="appointment-speciality" style={{ color: 'var(--success-color)' }}>
                          {treatment.diagnosis || 'No diagnosis recorded'}
                        </div>
                      </div>
                    </div>
                    {treatment.notes && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                          {treatment.notes}
                        </div>
                      </div>
                    )}
                    {treatment.prescriptions && treatment.prescriptions.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                          Prescriptions:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {treatment.prescriptions.map((prescription, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: 'var(--secondary-light)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.8125rem',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--secondary-color)'
                              }}
                            >
                              {prescription.medicine} {prescription.dosage && `- ${prescription.dosage}`}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!selectedPatient.appointments || selectedPatient.appointments.length === 0) &&
           (!selectedPatient.labResults || selectedPatient.labResults.length === 0) &&
           (!selectedPatient.treatments || selectedPatient.treatments.length === 0) && (
            <div className="card">
              <div className="empty-state">
                <p className="empty-state-text">No medical records available for this patient yet.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PatientRecords;

