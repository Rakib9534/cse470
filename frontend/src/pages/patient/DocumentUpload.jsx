import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

function DocumentUpload() {
  const { user } = useAuth();
  const storageKey = user ? `patientDocuments_${user.email}` : 'patientDocuments_guest';

  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setDocuments(JSON.parse(saved));
    }
  }, [storageKey]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please choose a document to upload.');
      return;
    }

    const newDoc = {
      id: Date.now().toString(),
      fileName: file.name,
      fileType: file.type || 'document',
      description,
      uploadedAt: new Date().toISOString()
    };

    const updated = [...documents, newDoc];
    setDocuments(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    setFile(null);
    setDescription('');
    e.target.reset();
    setMessage('Document metadata saved locally. Please share files with your doctor as needed.');
  };

  const handleDelete = (id) => {
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">My Documents</h1>
          <p className="card-subtitle">Upload and keep track of your important medical documents</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Choose File</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="form-input"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (e.g., MRI report, blood test)</label>
            <input
              type="text"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {message && (
            <div className={message.includes('saved') ? 'success-message' : 'error-message'} style={{ marginBottom: '1rem' }}>
              {message}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Save Document
          </button>
        </form>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Saved Documents</h2>
          {documents.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No documents saved yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {documents.map((doc) => (
                <div key={doc.id} className="appointment-card" style={{ borderLeftColor: 'var(--accent-color)' }}>
                  <div className="appointment-header">
                    <div>
                      <div className="appointment-doctor">{doc.fileName}</div>
                      <div className="appointment-speciality">
                        {doc.description || 'No description'} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                      onClick={() => handleDelete(doc.id)}
                    >
                      Remove
                    </button>
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

export default DocumentUpload;

