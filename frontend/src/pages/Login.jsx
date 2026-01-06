import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import HospitalLogo from '../components/HospitalLogo.jsx';
import '../App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (!role) {
      setError('Please select a role.');
      return;
    }

    try {
      const result = await login(email, password, role);
      
      if (result.success) {
        // Redirect based on role
        if (role === 'doctor') {
          navigate('/doctor-portal');
        } else if (role === 'admin') {
          navigate('/admin-portal');
        } else {
          navigate('/patient-portal');
        }
      } else {
        setError(result.error || 'Invalid credentials. Please check your email, password, and role.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
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
      <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ margin: '0 auto 2rem', display: 'flex', justifyContent: 'center' }}>
            <HospitalLogo size={140} showText={false} />
          </div>
          <h1 className="card-title" style={{ marginBottom: '0.5rem' }}>Hospital Management System</h1>
          <p className="card-subtitle">Sign in to access your portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Select Role <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Email / Username <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email or admin"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Sign In
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
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

