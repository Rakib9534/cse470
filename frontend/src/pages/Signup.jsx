import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import HospitalLogo from '../components/HospitalLogo.jsx';
import '../App.css';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    // Prepare user data for registration
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone || '',
      address: formData.address || ''
    };

    // Register user using controller
    const success = await register(userData);
    setLoading(false);

    if (success) {
      // Redirect based on role
      if (formData.role === 'doctor') {
        navigate('/doctor-portal');
      } else {
        navigate('/patient-portal');
      }
    } else {
      // Error message is already set in AuthContext, but we can add a fallback
      setError('Registration failed. Please check your information and try again. Make sure MongoDB is running and the backend server is connected.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #E8F4F8 0%, #E8F8F5 100%)',
      backgroundColor: '#F7FAFC',
      padding: '2rem'
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="card-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ margin: '0 auto 2rem', display: 'flex', justifyContent: 'center' }}>
            <HospitalLogo size={140} showText={false} />
          </div>
          <h1 className="card-title" style={{ marginBottom: '0.5rem' }}>Create Account</h1>
          <p className="card-subtitle">Join our hospital management system</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Select Role <span className="required">*</span>
            </label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
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

          <div className="form-group">
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min. 6 characters)"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          padding: '1rem',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;

