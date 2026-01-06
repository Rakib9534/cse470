import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useControllers } from '../../controllers/ControllerProvider.jsx';

function MedicalHistory() {
  const { user } = useAuth();
  const { treatment: treatmentController, labResult: labResultController } = useControllers();

  const [loading, setLoading] = useState(true);
  const [treatments, setTreatments] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!user?.email) return;
      try {
        setLoading(true);
        setError('');

        const [treatmentRes, labRes] = await Promise.all([
          treatmentController.getAllTreatments({ email: user.email }),
          labResultController.getAllLabResults({ email: user.email })
        ]);

        if (treatmentRes.success) {
          setTreatments(treatmentRes.treatments.map(t => t.toJSON()));
        }
        if (labRes.success) {
          setLabResults(labRes.labResults.map(r => r.toJSON()));
        }
      } catch (err) {
        console.error('Error loading medical history:', err);
        setError('Failed to load medical history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, treatmentController, labResultController]);

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Medical History</h1>
          <p className="card-subtitle">View your diagnoses, treatments, and lab reports</p>
        </div>

        {loading ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <p className="empty-state-text">Loading your medical history...</p>
          </div>
        ) : error ? (
          <div className="error-message" style={{ padding: '1.5rem' }}>{error}</div>
        ) : (
          <div style={{ padding: '1.5rem', display: 'grid', gap: '1.5rem' }}>
            {/* Treatments Section */}
            <section>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Treatments & Diagnoses</h2>
              {treatments.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state-text">No treatment records found.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {treatments.map((treatment) => (
                    <div key={treatment.id} className="appointment-card" style={{ borderLeftColor: 'var(--success-color)' }}>
                      <div className="appointment-header">
                        <div>
                          <div className="appointment-doctor">{treatment.diagnosis || 'Treatment Record'}</div>
                          <div className="appointment-speciality">
                            {treatment.doctorName || 'Doctor'} • {new Date(treatment.treatmentDate || treatment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="appointment-details">
                        {treatment.notes && (
                          <div className="appointment-detail" style={{ gridColumn: '1 / -1' }}>
                            <span className="appointment-detail-label">Notes</span>
                            <span className="appointment-detail-value">{treatment.notes}</span>
                          </div>
                        )}
                        {treatment.prescriptions && treatment.prescriptions.length > 0 && (
                          <div className="appointment-detail" style={{ gridColumn: '1 / -1' }}>
                            <span className="appointment-detail-label">Prescriptions</span>
                            <span className="appointment-detail-value">
                              {treatment.prescriptions.map((p, idx) => (
                                <span key={idx} style={{ display: 'inline-block', marginRight: '0.5rem' }}>
                                  {p.medicine}{p.dosage ? ` (${p.dosage})` : ''}
                                </span>
                              ))}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Lab Results Section */}
            <section>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Lab Reports</h2>
              {labResults.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state-text">No lab reports found.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {labResults.map((report) => (
                    <div key={report.id} className="appointment-card" style={{ borderLeftColor: 'var(--warning-color)' }}>
                      <div className="appointment-header">
                        <div>
                          <div className="appointment-doctor">Lab Report - {report.testType}</div>
                          <div className="appointment-speciality">
                            Test Date: {new Date(report.testDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="appointment-details">
                        <div className="appointment-detail">
                          <span className="appointment-detail-label">Reported On</span>
                          <span className="appointment-detail-value">
                            {report.reportDate ? new Date(report.reportDate).toLocaleDateString() : '-'}
                          </span>
                        </div>
                        {report.notes && (
                          <div className="appointment-detail" style={{ gridColumn: '1 / -1' }}>
                            <span className="appointment-detail-label">Notes</span>
                            <span className="appointment-detail-value">{report.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default MedicalHistory;

