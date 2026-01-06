import { useState, useEffect } from 'react';
import { useControllers } from '../../controllers/ControllerProvider.jsx';
import { notificationAPI } from '../../services/api.js';

function TreatmentNotes({ doctorId }) {
  const { appointment: appointmentController, treatment: treatmentController } = useControllers();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptions, setPrescriptions] = useState([{ medicine: '', dosage: '', frequency: '' }]);
  const [message, setMessage] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load appointments and treatment history from backend API
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

        // Load treatments for this doctor
        const treatmentsResult = await treatmentController.getAllTreatments({ doctorId });
        if (treatmentsResult.success) {
          setTreatmentHistory(treatmentsResult.treatments.map(t => t.toJSON()));
        }
      } catch (error) {
        console.error('Error loading treatment data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [doctorId, appointmentController, treatmentController]);

  // Get unique patients
  const getUniquePatients = () => {
    const patientsMap = new Map();
    appointments.forEach(apt => {
      if (!patientsMap.has(apt.email)) {
        patientsMap.set(apt.email, {
          email: apt.email,
          name: apt.patientName,
          phone: apt.phone
        });
      }
    });
    return Array.from(patientsMap.values());
  };

  const patients = getUniquePatients();

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, { medicine: '', dosage: '', frequency: '' }]);
  };

  const handleRemovePrescription = (index) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPatient || !appointmentDate || !diagnosis) {
      setMessage('Please fill all required fields.');
      return;
    }

    const patient = patients.find(p => p.email === selectedPatient);
    if (!patient) {
      setMessage('Please select a valid patient.');
      return;
    }

    if (!doctorId || doctorId === 'doctor-placeholder') {
      setMessage('Please log in to add treatment notes.');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      const treatmentData = {
        patientEmail: selectedPatient,
        treatmentDate: appointmentDate,
        diagnosis,
        notes,
        prescriptions: prescriptions.filter(p => p.medicine.trim() !== '')
      };

      const result = await treatmentController.createTreatment(treatmentData);

      if (result.success) {
        // Refresh treatment history
        const treatmentsResult = await treatmentController.getAllTreatments({ doctorId });
        if (treatmentsResult.success) {
          setTreatmentHistory(treatmentsResult.treatments.map(t => t.toJSON()));
        }

        // Create notification
        try {
          await notificationAPI.create({
            title: 'Treatment Record Added',
            message: `Treatment notes and prescription added for ${patient.name}`,
            type: 'treatment'
          });
        } catch (err) {
          console.error('Failed to create notification:', err);
        }

        setMessage('Treatment notes and prescription saved successfully.');
        
        // Reset form
        setSelectedPatient('');
        setAppointmentDate('');
        setDiagnosis('');
        setNotes('');
        setPrescriptions([{ medicine: '', dosage: '', frequency: '' }]);
      } else {
        setMessage(`Error: ${result.error || 'Failed to save treatment notes.'}`);
      }
    } catch (error) {
      console.error('Error saving treatment:', error);
      setMessage(`Error: ${error.message || 'Failed to save treatment notes.'}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Treatment Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Add Treatment Notes</h2>
            <p className="card-subtitle">Record diagnosis, notes, and prescriptions</p>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
            <div className="form-group">
              <label className="form-label">
                Select Patient <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                required
              >
                <option value="">Choose a patient...</option>
                {patients.map((patient) => (
                  <option key={patient.email} value={patient.email}>
                    {patient.name} ({patient.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Appointment Date <span className="required">*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Diagnosis <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis (e.g., Hypertension, Diabetes Type 2)"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Treatment Notes</label>
              <textarea
                className="form-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter detailed treatment notes, observations, and recommendations..."
                rows="5"
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Prescriptions</label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddPrescription}
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                  + Add Medicine
                </button>
              </div>
              
              {prescriptions.map((prescription, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.75rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Medicine #{index + 1}
                    </span>
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePrescription(index)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--accent-color)',
                          cursor: 'pointer',
                          fontSize: '1.25rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={prescription.medicine}
                      onChange={(e) => handlePrescriptionChange(index, 'medicine', e.target.value)}
                      placeholder="Medicine name"
                      style={{ fontSize: '0.875rem' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      value={prescription.dosage}
                      onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                      placeholder="Dosage (e.g., 500mg)"
                      style={{ fontSize: '0.875rem' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      value={prescription.frequency}
                      onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                      placeholder="Frequency (e.g., 2x daily)"
                      style={{ fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Treatment Notes'}
            </button>
          </form>

          {message && (
            <div className={message.includes('successfully') ? 'success-message' : 'error-message'} style={{ marginTop: '1.5rem' }}>
              {message}
            </div>
          )}
        </div>

        {/* Treatment History */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Treatments</h2>
            <p className="card-subtitle">View your treatment history</p>
          </div>

          {loading ? (
            <div className="empty-state">
              <p className="empty-state-text">Loading treatment history...</p>
            </div>
          ) : treatmentHistory.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No treatment records yet. Start adding treatment notes to see them here.</p>
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              {treatmentHistory.slice().reverse().map((treatment) => (
                <div key={treatment.id} className="appointment-card" style={{ borderLeftColor: 'var(--success-color)', marginBottom: '1rem' }}>
                  <div className="appointment-header">
                    <div>
                      <div className="appointment-doctor">{treatment.patientName}</div>
                      <div className="appointment-speciality" style={{ color: 'var(--success-color)' }}>
                        {new Date(treatment.date).toLocaleDateString()} • {treatment.diagnosis}
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
                            <div style={{ fontWeight: '600' }}>{prescription.medicine}</div>
                            {prescription.dosage && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                {prescription.dosage} {prescription.frequency && `• ${prescription.frequency}`}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    Recorded: {new Date(treatment.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TreatmentNotes;

