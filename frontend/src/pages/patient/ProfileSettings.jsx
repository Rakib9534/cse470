import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { userAPI } from '../../services/api.js';
import UserModel from '../../models/UserModel.js';

function ProfileSettings() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setError('Please log in to update your profile.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const result = await userAPI.update(user.id, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      });

      if (result.success) {
        setMessage('Profile updated successfully! Please refresh the page or log out and log back in to see changes.');
        setTimeout(() => setMessage(''), 5000);
      } else {
        setError(result.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Profile Settings</h1>
          <p className="card-subtitle">View and update your personal information</p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Email (read-only)
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              readOnly
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Address
            </label>
            <input
              type="text"
              name="address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
            />
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>
          )}
          {message && (
            <div className="success-message" style={{ marginBottom: '1rem' }}>{message}</div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSettings;

