import { useState, useEffect } from 'react';
import { addNotification } from '../services/notificationService';

function LabUpload() {
  const [patientId, setPatientId] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientName, setPatientName] = useState('');
  const [testType, setTestType] = useState('');
  const [testDate, setTestDate] = useState('');
  const [labFile, setLabFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [uploadedResults, setUploadedResults] = useState([]);

  // Load uploaded results from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('labResults');
    if (saved) {
      setUploadedResults(JSON.parse(saved));
    }
  }, []);

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (message && message.includes('successfully')) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLabFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!patientId || !testType || !testDate || !labFile || !technicianName) {
      setMessage('Please fill all required fields.');
      return;
    }

    const newLabResult = {
      id: Date.now().toString(),
      patientId,
      patientEmail: patientEmail || null,
      patientName: patientName || null,
      testType,
      testDate,
      fileName: fileName,
      technicianName,
      notes,
      uploadDate: new Date().toISOString().split('T')[0],
    };

    const updatedResults = [...uploadedResults, newLabResult];
    setUploadedResults(updatedResults);
    localStorage.setItem('labResults', JSON.stringify(updatedResults));

    // Add notification for lab result upload
    addNotification({
      id: Date.now().toString(),
      title: 'Lab Report Uploaded',
      message: `Lab result for ${testType} has been uploaded for Patient ID: ${patientId}`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'lab_result'
    });

    setMessage('Lab result uploaded successfully for Patient ID: ' + patientId);
    
    // Reset form
    setPatientId('');
    setPatientEmail('');
    setPatientName('');
    setTestType('');
    setTestDate('');
    setLabFile(null);
    setFileName('');
    setTechnicianName('');
    setNotes('');
    e.target.reset();
  };

  const handlePatientIdFilter = (e) => {
    setPatientId(e.target.value);
  };

  const filteredResults = patientId
    ? uploadedResults.filter((result) => result.patientId === patientId)
    : uploadedResults;

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Upload Lab Results</h1>
          <p className="card-subtitle">Lab Technician Portal - Upload patient lab test results</p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
          <div className="form-group">
            <label className="form-label">
              Patient ID <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter patient ID (e.g., P001, P002)"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Patient Email (Optional)
            </label>
            <input
              type="email"
              className="form-input"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              placeholder="Enter patient email for easier report access"
            />
            <small style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'block' }}>
              This helps patients find their reports using their email
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">
              Patient Name (Optional)
            </label>
            <input
              type="text"
              className="form-input"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient full name"
            />
            <small style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', display: 'block' }}>
              This helps patients find their reports using their name
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">
              Test Type <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              required
            >
              <option value="">Select test type</option>
              <option value="Blood Test">Blood Test</option>
              <option value="Urine Test">Urine Test</option>
              <option value="X-Ray">X-Ray</option>
              <option value="CT Scan">CT Scan</option>
              <option value="MRI">MRI</option>
              <option value="ECG">ECG</option>
              <option value="Ultrasound">Ultrasound</option>
              <option value="Biopsy">Biopsy</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Test Date <span className="required">*</span>
            </label>
            <input
              type="date"
              className="form-input"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Lab Technician Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Lab Result File <span className="required">*</span>
            </label>
            <div style={{ 
              border: '2px dashed var(--border-color)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.5rem',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              backgroundColor: labFile ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-secondary)'
            }}>
              <input
                type="file"
                id="labFile"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                required
              />
              <label htmlFor="labFile" style={{ cursor: 'pointer', display: 'block' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  margin: '0 auto 0.75rem',
                  borderRadius: 'var(--radius-lg)',
                  background: labFile ? 'var(--primary-lighter)' : 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 15H16V17H8V15ZM8 11H13V13H8V11Z" fill={labFile ? 'var(--primary-color)' : 'var(--text-tertiary)'}/>
                  </svg>
                </div>
                {fileName ? (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--primary-color)', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                      {fileName}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                      Click to change file
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                      Click to upload lab result file
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                      PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea
              className="form-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or observations..."
              rows="4"
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Upload Lab Result
          </button>
        </form>

        {message && (
          <div className={message.includes('successfully') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}
      </div>

      {/* Uploaded Results Section */}
      {uploadedResults.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <h2 className="card-title">Uploaded Lab Results</h2>
            <p className="card-subtitle">View previously uploaded lab results</p>
          </div>

          <div className="filter-container">
            <label className="form-label">Filter by Patient ID</label>
            <input
              type="text"
              className="filter-input"
              value={patientId}
              onChange={handlePatientIdFilter}
              placeholder="Enter patient ID to filter results"
            />
          </div>

          {filteredResults.length === 0 ? (
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
                  <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="var(--text-light)"/>
                </svg>
              </div>
              <p className="empty-state-text">
                No lab results found for this patient ID.
              </p>
            </div>
          ) : (
            <div style={{ marginTop: '2rem' }}>
              {filteredResults.map((result) => (
                <div key={result.id} className="appointment-card" style={{ borderLeftColor: 'var(--accent-color)' }}>
                  <div className="appointment-header">
                    <div>
                      <div className="appointment-doctor">Patient ID: {result.patientId}</div>
                      <div className="appointment-speciality">{result.testType}</div>
                    </div>
                  </div>
                  <div className="appointment-details">
                    <div className="appointment-detail">
                      <span className="appointment-detail-label">Test Date</span>
                      <span className="appointment-detail-value">{result.testDate}</span>
                    </div>
                    <div className="appointment-detail">
                      <span className="appointment-detail-label">Upload Date</span>
                      <span className="appointment-detail-value">{result.uploadDate}</span>
                    </div>
                    <div className="appointment-detail">
                      <span className="appointment-detail-label">File Name</span>
                      <span className="appointment-detail-value">{result.fileName}</span>
                    </div>
                    <div className="appointment-detail">
                      <span className="appointment-detail-label">Technician</span>
                      <span className="appointment-detail-value">{result.technicianName}</span>
                    </div>
                    {result.notes && (
                      <div className="appointment-detail" style={{ gridColumn: '1 / -1' }}>
                        <span className="appointment-detail-label">Notes</span>
                        <span className="appointment-detail-value">{result.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LabUpload;

